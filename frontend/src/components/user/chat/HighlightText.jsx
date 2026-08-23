export default function HighlightText({ text, query }) {

    if (!text) return null;

    const trimmed = typeof query === "string" ? query.trim() : "";

    if (!trimmed) return text;

    const haystack = text.toLowerCase();

    const needle = trimmed.toLowerCase();

    if (!haystack.includes(needle)) return text;

    const parts = [];

    let cursor = 0;

    let index = haystack.indexOf(needle);

    while (index !== -1) {

        if (index > cursor) {

            parts.push(text.slice(cursor, index));

        }

        parts.push(

            <mark key={parts.length} className="chat-search-hit">

                {text.slice(index, index + needle.length)}

            </mark>

        );

        cursor = index + needle.length;

        index = haystack.indexOf(needle, cursor);

    }

    if (cursor < text.length) {

        parts.push(text.slice(cursor));

    }

    return parts;

}
