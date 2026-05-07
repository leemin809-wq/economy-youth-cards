import json
import sys
import re
from datetime import timedelta

def format_time(seconds):
    td = timedelta(seconds=seconds)
    total_seconds = int(td.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    secs = total_seconds % 60
    millis = int((seconds - int(seconds)) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

def split_into_chunks(text, max_chars=20):
    sentences = re.split(r'(?<=[.!?。])\s+|(?<=다\.)\s+|(?<=요\.)\s+', text)
    chunks = []
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        if len(sentence) <= max_chars:
            chunks.append(sentence)
        else:
            words = sentence.split()
            current = ""
            for word in words:
                if len(current) + len(word) + 1 <= max_chars:
                    current = f"{current} {word}".strip()
                else:
                    if current:
                        chunks.append(current)
                    current = word
            if current:
                chunks.append(current)
    return chunks

def generate_srt(data_file, output_file):
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    full_script = data.get('fullTTSScript', '')
    total_duration = 15.0

    chunks = split_into_chunks(full_script)

    if not chunks:
        print("자막 텍스트가 없습니다.")
        sys.exit(1)

    chunk_duration = total_duration / len(chunks)

    srt_lines = []
    for i, chunk in enumerate(chunks):
        start = i * chunk_duration
        end = (i + 1) * chunk_duration - 0.1
        srt_lines.append(str(i + 1))
        srt_lines.append(f"{format_time(start)} --> {format_time(end)}")
        srt_lines.append(chunk)
        srt_lines.append("")

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(srt_lines))

    print(f"SRT 생성 완료: {output_file} / {len(chunks)}개 라인")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("사용법: python3 generate-srt.py <데이터.json> <출력.srt>")
        sys.exit(1)
    generate_srt(sys.argv[1], sys.argv[2])
