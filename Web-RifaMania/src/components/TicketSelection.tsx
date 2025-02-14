import { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface TicketSelectionProps {
  availableNumbers: number[]; // Novo campo para os números disponíveis
  onSelectionChange: (selectedTickets: number[]) => void;
}

export default function TicketSelection({
  availableNumbers,
  onSelectionChange,
}: TicketSelectionProps) {
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);

  const handleTicketToggle = (ticketNumber: number) => {
    setSelectedTickets((prevSelected) =>
      prevSelected.includes(ticketNumber)
        ? prevSelected.filter((num) => num !== ticketNumber)
        : [...prevSelected, ticketNumber]
    );
  };

  useEffect(() => {
    onSelectionChange(selectedTickets);
  }, [selectedTickets, onSelectionChange]);

  return (
    <div className="grid grid-cols-10 gap-2 p-4">
      {availableNumbers.map((ticketNumber) => (
        <Button
          key={ticketNumber}
          onClick={() => handleTicketToggle(ticketNumber)}
          className={`h-12 w-12 rounded-lg text-center text-white ${
            selectedTickets.includes(ticketNumber)
              ? "bg-raffle-main"
              : "bg-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          {ticketNumber}
        </Button>
      ))}
    </div>
  );
}
