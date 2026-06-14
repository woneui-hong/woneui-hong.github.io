/**
 * Link preview card styles are applied via global CSS classes
 * generated during markdown processing (see src/lib/remark-embeds.ts).
 * This module documents the card structure for reference.
 */
export interface LinkPreviewCardProps {
  url: string
  title?: string
  description?: string
  image?: string
}

export const LINK_PREVIEW_CARD_CLASS = 'link-preview-card'
