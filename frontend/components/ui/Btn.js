"use client"

export default function Btn(props) {
  return (
    <button 
      className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
      onClick={() => props.fn()}>
      {props.text}
    </button>
  );
}
