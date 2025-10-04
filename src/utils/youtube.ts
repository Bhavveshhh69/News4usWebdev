// Utility helpers for working with YouTube URLs and IDs
export function parseYouTubeId(input: string): string | null {
  if (!input) return null;
  const match = input.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/);
  return match ? match[1] : null;
}

export function extractYouTubeId(input: string): string {
  if (!input) return "";
  const value = input.trim();

  // If input already looks like a raw ID, accept it
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;

  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, '').toLowerCase();

    // youtu.be/<id>
    if (hostname === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0] || '';
      return validIdOrEmpty(id);
    }

    if (hostname.endsWith('youtube.com')) {
      const pathParts = url.pathname.split('/').filter(Boolean);

      // /watch?v=<id>
      const vParam = url.searchParams.get('v');
      if (vParam && validIdOrEmpty(vParam)) {
        return vParam;
      }

      // /embed/<id>, /v/<id>, /shorts/<id>
      if (pathParts.length >= 2) {
        const [first, maybeId] = pathParts;
        if ((first === 'embed' || first === 'v' || first === 'shorts') && validIdOrEmpty(maybeId)) {
          return maybeId;
        }
      }
    }
  } catch {
    // Not a full URL; fall through
  }

  // Fallback: find plausible ID
  const match = value.match(/[a-zA-Z0-9_-]{11}/);
  return match ? match[0] : '';
}

function validIdOrEmpty(candidate: string | null | undefined): string {
  if (!candidate) return '';
  const trimmed = candidate.trim();
  return /^[a-zA-Z0-9_-]{11}$/.test(trimmed) ? trimmed : '';
}


