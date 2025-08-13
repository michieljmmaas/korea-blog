import Link from "next/link";

const Footer = () => {
  return (
    <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight mb-2 mt-8 flex items-center">
      <Link href="/" className="hover:underline">
        Seoullo
      </Link>
      .
    </h2>
  );
};

export default Footer;
