import json

with open('/Users/caglaarat/.gemini/antigravity-ide/brain/9b3ec7ec-6b3e-4250-a91f-d691727f5034/.system_generated/logs/transcript.jsonl', 'r') as f:
    lines = f.readlines()

for line in reversed(lines):
    try:
        data = json.loads(line)
        if data.get('type') == 'USER_INPUT' and '2026 FIFA Dünya Kupası kadroları' in data.get('content', ''):
            with open('scratch/full_squads.md', 'w') as out:
                out.write(data['content'])
            print("Extracted full squads to scratch/full_squads.md")
            break
    except Exception as e:
        pass
