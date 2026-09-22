/**
 * Renders structured data for search engines.
 *
 * The payload is JSON-serialised and escaped so listing text containing `<`
 * or `&` cannot break out of the script element.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"

      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
