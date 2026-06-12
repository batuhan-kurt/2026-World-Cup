import json

with open('/Users/caglaarat/.gemini/antigravity-ide/brain/9b3ec7ec-6b3e-4250-a91f-d691727f5034/.system_generated/logs/transcript.jsonl', 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data:
                for tc in data['tool_calls']:
                    if tc['name'] == 'write_to_file' and 'wc2026-groups.json' in tc.get('args', {}).get('TargetFile', ''):
                        print(tc['args']['CodeContent'][:500])
                        with open('scratch/recovered_groups.json', 'w') as out:
                            out.write(tc['args']['CodeContent'])
                        print("Saved to scratch/recovered_groups.json")
                        exit(0)
        except Exception as e:
            pass
