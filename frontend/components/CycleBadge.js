export default function CycleBadge({ typeCycle }) {
  const estReactif = typeCycle === 'reactif';
  return (
    <span className={`badge ${estReactif ? 'badge-reactif' : 'badge-quotidien'}`}>
      {estReactif ? 'Actualité chaude' : 'Analyse du jour'}
    </span>
  );
}
