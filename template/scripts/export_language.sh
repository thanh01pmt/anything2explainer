#!/bin/zsh
# export_language.sh - Language-Tracks Muxer
# Học từ kiến trúc Language-Tracks của Kiteva (motion-graphics-agent):
# Tái sử dụng 100% video master và mux với track giọng đọc ngôn ngữ mới (Tiếng Việt/Anh/Trung)
# Thời gian xuất: ~1-2 giây (thay vì re-render 8000 frames video mất 1-2 tiếng).
#
# Cách dùng:
#   scripts/export_language.sh <master_video.mp4> <narration_audio.wav> <output.mp4> [subtitles.srt] [bgm.mp3]
#
# Lưu ý quan trọng:
# Mặc định, script sẽ THAY THẾ (replace) hoàn toàn audio của master video bằng narration mới
# để tránh tình trạng voiceover cũ (ví dụ tiếng Anh/Trung) bị đè lên voiceover mới (tiếng Việt).
# Nếu muốn thêm nhạc nền (BGM), hãy truyền file nhạc nền ở tham số thứ 5 [bgm.mp3].

set -e

MASTER_VIDEO="$1"
NARRATION_AUDIO="$2"
OUTPUT_VIDEO="$3"
SUBTITLES="$4"
BGM_AUDIO="$5"

if [ -z "$MASTER_VIDEO" ] || [ -z "$NARRATION_AUDIO" ] || [ -z "$OUTPUT_VIDEO" ]; then
  echo "Usage: $0 <master_video.mp4> <narration_audio.wav> <output.mp4> [subtitles.srt] [bgm.mp3]"
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

# Lấy thời lượng của Narration Audio để đồng bộ video
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$NARRATION_AUDIO")
echo "  - Thời lượng giọng đọc: ${DURATION}s"

if [ -n "$BGM_AUDIO" ] && [ -f "$BGM_AUDIO" ]; then
  echo "🎵 Hòa âm giọng đọc mới với file nhạc nền BGM độc lập (Auto-ducking: Voice 1.0, BGM 0.18)..."
  if [ -n "$SUBTITLES" ] && [ -f "$SUBTITLES" ]; then
    echo "📝 Đính kèm phụ đề mềm (Soft subtitles)..."
    ffmpeg -v error -y \
      -i "$MASTER_VIDEO" \
      -i "$NARRATION_AUDIO" \
      -stream_loop -1 -i "$BGM_AUDIO" \
      -i "$SUBTITLES" \
      -filter_complex "[2:a]volume=0.18[bgm];[1:a]volume=1.0[voice];[bgm][voice]amix=inputs=2:duration=first:dropout_transition=2[aout]" \
      -map 0:v -map "[aout]" -map 3:s \
      -c:v copy \
      -c:a aac -b:a 192k \
      -c:s mov_text \
      -t "$DURATION" \
      "$OUTPUT_VIDEO"
  else
    ffmpeg -v error -y \
      -i "$MASTER_VIDEO" \
      -i "$NARRATION_AUDIO" \
      -stream_loop -1 -i "$BGM_AUDIO" \
      -filter_complex "[2:a]volume=0.18[bgm];[1:a]volume=1.0[voice];[bgm][voice]amix=inputs=2:duration=first:dropout_transition=2[aout]" \
      -map 0:v -map "[aout]" \
      -c:v copy \
      -c:a aac -b:a 192k \
      -t "$DURATION" \
      "$OUTPUT_VIDEO"
  fi
else
  echo "🔊 Thay thế hoàn toàn track âm thanh bằng giọng đọc mới (Zero audio bleed)..."
  if [ -n "$SUBTITLES" ] && [ -f "$SUBTITLES" ]; then
    echo "📝 Đính kèm phụ đề mềm (Soft subtitles)..."
    ffmpeg -v error -y \
      -i "$MASTER_VIDEO" \
      -i "$NARRATION_AUDIO" \
      -i "$SUBTITLES" \
      -map 0:v -map 1:a -map 2:s \
      -c:v copy \
      -c:a aac -b:a 192k \
      -c:s mov_text \
      -t "$DURATION" \
      "$OUTPUT_VIDEO"
  else
    ffmpeg -v error -y \
      -i "$MASTER_VIDEO" \
      -i "$NARRATION_AUDIO" \
      -map 0:v -map 1:a \
      -c:v copy \
      -c:a aac -b:a 192k \
      -t "$DURATION" \
      "$OUTPUT_VIDEO"
  fi
fi

echo "✅ Hoàn tất! Video ngôn ngữ mới đã sẵn sàng tại: $OUTPUT_VIDEO"
