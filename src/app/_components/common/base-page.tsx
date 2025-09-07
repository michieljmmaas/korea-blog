type Props = {
  children?: React.ReactNode;
};

const BasePage = ({ children }: Props) => {
  return <div className="max-w-6xl mx-auto">{children}</div>;
};

export default BasePage;
