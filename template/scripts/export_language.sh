#!/bin/zsh
# export_language.sh - Language-Tracks Muxer
# Học từ kiến trúc Language-Tracks của Kiteva (motion-graphics-agent):
# Tái sử dụng 100% video master (full.music.mp4) và mux với track giọng đọc ngôn ngữ mới (Tiếng Việt/Anh/Trung)
# Thời gian xuất: ~1-2 giây (thay vì re-render 8000 frames video mất 1-2 tiếng).
#
# Cách dùng:
#   scripts/export_language.sh <master_video.mp4> <narration_audio.wav> <output.mp4> [subtitles.srt]

set -e

MASTER_VIDEO="$1"
NARRATION_AUDIO="$2"
OUTPUT_VIDEO="$3"
SUBTITLES="$4"

if [ -z "$MASTER_VIDEO" ] || [ -z "$NARRATION_AUDIO" ] || [ -z "$OUTPUT_VIDEO" ]; then
  echo "Usage: $0 <master_video.mp4> <narration_audio.wav> <output.mp4> [subtitles.srt]"
  exit 1
fi

if [ ! -f "$MASTER_VIDEO" ]; then
  echo "Error: Master video not found: $MASTER_VIDEO"
  exit 1
fi

if [ ! -f "$NARRATION_AUDIO" ]; then
  echo "Error: Narration audio not found: $NARRATION_AUDIO"
  exit 1
fi

echo "🎬 [Language-Tracks] Bắt đầu ghép ngôn ngữ mới..."
echo "  - Master Video: $MASTER_VIDEO"
echo "  - Voiceover Track: $NARRATION_AUDIO"
echo "  - Output Target: $OUTPUT_VIDEO"

# Kiểm tra xem Master Video có sẵn track âm thanh nền (BGM) không
HAS_AUDIO=$(ffprobe -i "$MASTER_VIDEO" -show_streams -select_streams a -loglevel error | wc -l)

if [ "$HAS_AUDIO" -gt 0 ]; then
  echo "🎵 Hòa âm giọng đọc mới với track nhạc nền gốc của Master Video (Auto-ducking)..."
  # Dùng bộ lọc amix để hòa trộn: Voiceover (âm lượng 1.0) + Master BGM (âm lượng 0.25)
  if [ -n "$SUBTITLES" ] && [ -f "$SUBTITLES" ]; then
    echo "📝 Đính kèm phụ đề mềm (Soft subtitles)..."
    ffmpeg -v error -y \
      -i "$MASTER_VIDEO" \
      -i "$NARRATION_AUDIO" \
      -i "$SUBTITLES" \
      -filter_complex "[0:a]volume=0.25[bgm];[1:a]volume=1.0[voice];[bgm][voice]amix=inputs=2:duration=first:dropout_transition=2[aout]" \
      -map 0:v -map "[aout]" -map 2:s \
      -c:v copy \
      -c:a aac -b:a 192k \
      -c:s mov_text \
      "$OUTPUT_VIDEO"
  else
    ffmpeg -v error -y \
      -i "$MASTER_VIDEO" \
      -i "$NARRATION_AUDIO" \
      -filter_complex "[0:a]volume=0.25[bgm];[1:a]volume=1.0[voice];[bgm][voice]amix=inputs=2:duration=first:dropout_transition=2[aout]" \
      -map 0:v -map "[aout]" \
      -c:v copy \
      -c:a aac -b:a 192k \
      "$OUTPUT_VIDEO"
  fi
else
  echo "🔊 Ghép trực tiếp track giọng đọc mới vào luồng video gốc (-c:v copy)..."
  if [ -n "$SUBTITLES" ] && [ -f "$SUBTITLES" ]; then
    ffmpeg -v error -y \
      -i "$MASTER_VIDEO" \
      -i "$NARRATION_AUDIO" \
      -i "$SUBTITLES" \
      -map 0:v -map 1:a -map 2:s \
      -c:v copy \
      -c:a aac -b:a 192k \
      -c:s mov_text \
      "$OUTPUT_VIDEO"
  else
    ffmpeg -v error -y \
      -i "$MASTER_VIDEO" \
      -i "$NARRATION_AUDIO" \
      -map 0:v -map 1:a \
      -c:v copy \
      -c:a aac -b:a 192k \
      "$OUTPUT_VIDEO"
  fi
fi

echo "✅ Hoàn tất! Video ngôn ngữ mới đã sẵn sàng tại: $OUTPUT_VIDEO"
