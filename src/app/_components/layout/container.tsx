import BasePage from "../common/base-page";

type Props = {
  children?: React.ReactNode;
};

const Container = ({ children }: Props) => {
  return <div className="container mx-auto px-2"><BasePage>{children}</BasePage></div>;
};

export default Container;
