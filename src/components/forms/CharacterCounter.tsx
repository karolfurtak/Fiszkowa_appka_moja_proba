import * as React from 'react';

interface CharacterCounterProps {
  currentLength: number;
  maxLength?: number;
  minLength?: number;
}

/**
 * Komponent licznika znaków dla pól tekstowych
 */
export const CharacterCounter = React.memo(function CharacterCounter({ currentLength, maxLength, minLength }: CharacterCounterProps) {
  const getTextColor = () => {
    if (maxLength && currentLength > maxLength) {
      return 'text-destructive';
    }
    if (minLength && currentLength < minLength) {
      return 'text-orange-500';
    }
    return 'text-muted-foreground';
  };

  const formatText = () => {
    if (maxLength) {
      return `${currentLength} / ${maxLength} znaków`;
    }
    if (minLength) {
      return `${currentLength} znaków (min: ${minLength})`;
    }
    return `${currentLength} znaków`;
  };

  return (
    <div className={`text-sm text-right ${getTextColor()}`}>
      {formatText()}
    </div>
  );
});

