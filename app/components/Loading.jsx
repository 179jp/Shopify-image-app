import "./css/Loading.css";

export const Loading = ({ text = "Loading" }) => {
  return (
    <div className="loading">
      <p>{text}</p>
    </div>
  );
};
