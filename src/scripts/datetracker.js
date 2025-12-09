import Handlebars from 'handlebars';
Handlebars.registerHelper('formatDate', function (dateString) {
  if (!dateString) return 'недавно';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;

  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'только что';
  if (diffMin < 60) return `${diffMin} мин. назад`;
  if (diffHour < 24) return `${diffHour} ч. назад`;
  if (diffDay < 7) return `${diffDay} д. назад`;

  return date
    .toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    })
    .replace('.', '');
});
