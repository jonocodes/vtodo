// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
	it('returns empty string for empty input', () => {
		expect(renderMarkdown('')).toBe('');
	});

	it('renders basic markdown', () => {
		const html = renderMarkdown('**bold** text');
		expect(html).toContain('<strong>bold</strong>');
		expect(html).toContain('text');
	});

	it('renders task list checkboxes', () => {
		const html = renderMarkdown('- [ ] unchecked\n- [x] checked');
		expect(html).toContain('type="checkbox"');
		expect(html).toContain('checked');
	});

	it('renders links', () => {
		const html = renderMarkdown('[example](https://example.com)');
		expect(html).toContain('href="https://example.com"');
		expect(html).toContain('example');
	});

	it('sanitizes dangerous HTML', () => {
		const html = renderMarkdown('<script>alert("xss")</script>');
		expect(html).not.toContain('<script>');
	});

	it('renders line breaks with single newlines', () => {
		const html = renderMarkdown('line one\nline two');
		expect(html).toContain('<br');
	});
});
