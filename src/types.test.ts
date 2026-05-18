import { ChatMessage, isSystem, SystemMessage } from './types';

describe('isSystem', () => {
  it('returns true for a system message', () => {
    const sys: SystemMessage = {
      id: '1',
      text: 'x joined',
      ts: 0,
      system: true,
      event: { kind: 'joined', name: 'x' },
    };
    expect(isSystem(sys)).toBe(true);
  });

  it('returns false for a chat message', () => {
    const chat: ChatMessage = {
      id: '1',
      fromId: 'p1',
      fromName: 'Alice',
      text: 'hi',
      ts: 0,
    };
    expect(isSystem(chat)).toBe(false);
  });
});
