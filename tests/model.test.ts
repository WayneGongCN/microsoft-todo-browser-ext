import { describe, expect, it, vi } from 'vitest';
import { makeCapture } from '../src/core/capture';
import { safeSource, taskInput } from '../src/core/model';

describe('capture and task fields', () => {
  it('uses the clicked link instead of its containing page', () => {
    const capture = makeCapture('link', {
      url: 'https://example.com/page',
      linkUrl: 'https://example.com/destination?keep=1#anchor',
      title: 'Containing page',
    });
    expect(capture.source?.url).toBe('https://example.com/destination?keep=1#anchor');
  });

  it('preserves the full selection while keeping the title short', () => {
    const text = `${'A'.repeat(400)}\nSecond line`;
    const capture = makeCapture('selection', { text, url: 'https://example.com/' });
    expect(capture.title).toHaveLength(255);
    expect(capture.note).toBe(text);
  });

  it('rejects executable, browser-internal and credential-bearing sources', () => {
    for (const value of [
      'javascript:alert(1)',
      'data:text/plain,example',
      'chrome://settings',
      'https://user:password@example.com/',
    ])
      expect(safeSource(value)).toBeUndefined();
  });

  it('enables reminders and sends an explicit UTC date', () => {
    const reminder = '2035-02-10T10:30';
    const input = taskInput(
      { title: 'Remember', note: '', listId: 'list', important: true, reminder },
      new Date('2030-01-01').getTime(),
    );
    expect(input.isReminderOn).toBe(true);
    expect(input.reminderDateTime).toEqual({
      dateTime: new Date(reminder).toISOString().slice(0, -1),
      timeZone: 'UTC',
    });
    expect(input.importance).toBe('high');
  });

  it('refuses past reminders instead of silently sending an incorrect alert', () => {
    expect(() =>
      taskInput({
        title: 'Remember',
        note: '',
        listId: 'list',
        important: false,
        reminder: '2020-01-01T00:00',
      }),
    ).toThrow('invalid');
  });

  it('handles UTC date rollover and rejects a missing local hour at DST transition', () => {
    vi.stubEnv('TZ', 'America/New_York');
    try {
      const fields = {
        title: 'Remember',
        note: '',
        listId: 'list',
        important: false,
        reminder: '2026-01-01T23:30',
      };
      expect(taskInput(fields, 0).reminderDateTime).toEqual({
        dateTime: '2026-01-02T04:30:00.000',
        timeZone: 'UTC',
      });
      expect(() => taskInput({ ...fields, reminder: '2026-03-08T02:30' }, 0)).toThrow('invalid');
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
