import "./button.css";

interface GuessInputProps {
  onGiveUp: () => void;
  disabled?: boolean;
}

export default function GiveUpButton({ onGiveUp, disabled = false }: GuessInputProps) {

  const handleSubmit = () => {
    if (disabled) return;
    onGiveUp();
  }


  return (
    <div className="give-up-wrapper">
      <button 
        onClick={handleSubmit}
        disabled={disabled}
        className="give-up-button"
      >
        Give Up
      </button>
    </div>
  );
}