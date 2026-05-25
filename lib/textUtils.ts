export const parseHashtags = (content: string): string[] => {
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex);
  return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
};

export const parseMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const matches = content.match(mentionRegex);
  return matches ? matches.map(mention => mention.slice(1).toLowerCase()) : [];
};

export const linkifyContent = (content: string): string => {
  // Convert hashtags to links
  let linkedContent = content.replace(
    /#(\w+)/g,
    '<a href="/home/hashtag/$1" class="text-primary hover:underline">#$1</a>'
  );
  
  // Convert mentions to links
  linkedContent = linkedContent.replace(
    /@(\w+)/g,
    '<a href="/home/profile/$1" class="text-primary hover:underline">@$1</a>'
  );
  
  return linkedContent;
};
