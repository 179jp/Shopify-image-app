const h1Style = {
  fontSize: '1.25rem',
  fontWeight: 'bold',
};
const subTitleStyle = {
  fontSize: '0.75rem',
  fontWeight: 'normal',
  color: '#616161',
};

export const PageTitle = ({ title, subtitle = null }) => {
  return (
    <div>
      <h1 style={h1Style}>{title}</h1>
      {subtitle &&  <p style={subTitleStyle}>{subtitle}</p>}
    </div>
  );
}