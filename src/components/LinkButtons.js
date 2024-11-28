import Link from "next/link";

const NavigationButtons = () => {
  return (
    <ul className="flex justify-center space-x-4 mt-4">
      <li>
        <Link
          className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-center w-full"
          href="/groceries"
        >
          Groceries
        </Link>
      </li>
      <li>
        <Link
          className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-center w-full"
          href="/supplies"
        >
          Supplies
        </Link>
      </li>
    </ul>
  );
};

export default NavigationButtons;
