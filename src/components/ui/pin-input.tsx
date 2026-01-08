
'use client';

import React, { useRef, useState, useEffect, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PinInputProps {
  length?: number;
  onComplete?: (pin: string) => void;
  onChange?: (pin: string) => void;
  value: string;
  className?: string;
  inputClassName?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const PinInput: React.FC<PinInputProps> = ({
  length = 4,
  onComplete,
  onChange,
  value,
  className,
  inputClassName,
  inputRef,
}) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [pin, setPin] = useState<string[]>(new Array(length).fill(''));

  // Expose the first input's ref if inputRef is provided
  useImperativeHandle(inputRef, () => inputRefs.current[0] as HTMLInputElement);


  useEffect(() => {
    const newValue = value.split('');
    if (newValue.length <= length) {
        const newPin = new Array(length).fill('');
        newValue.forEach((char, index) => {
            newPin[index] = char;
        });
        setPin(newPin);
    }
  }, [value, length]);


  const handleChange = (element: HTMLInputElement, index: number) => {
    const newPin = [...pin];
    // Allow only digits
    if (/^[0-9]$/.test(element.value) || element.value === '') {
        newPin[index] = element.value;
        setPin(newPin);

        const newPinString = newPin.join('');
        if (onChange) {
            onChange(newPinString);
        }

        // Move to next input if a digit is entered
        if (element.value !== '' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Trigger onComplete when all inputs are filled
        if (newPinString.length === length) {
            onComplete?.(newPinString);
        }
    } else {
        // if not a digit, clear it.
        element.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').slice(0, length);
    if (/^[0-9]+$/.test(paste)) {
      const newPin = paste.split('').concat(new Array(length).fill('')).slice(0, length);
      
      const newPinString = newPin.join('');
       if (onChange) {
          onChange(newPinString);
       }
      
      const lastFilledIndex = Math.min(paste.length, length) - 1;
      if (inputRefs.current[lastFilledIndex]) {
        inputRefs.current[lastFilledIndex]?.focus();
      }

      if (newPinString.length === length) {
        onComplete?.(newPinString);
      }
    }
  };

  return (
    <div className={cn("flex justify-center gap-2", className)}>
      {pin.map((data, index) => (
        <Input
          key={index}
          type="password"
          maxLength={1}
          value={data}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={(e) => e.target.select()}
          onPaste={index === 0 ? handlePaste : undefined}
          ref={(el) => (inputRefs.current[index] = el)}
          className={cn("w-12 h-12 text-center text-xl", inputClassName)}
        />
      ))}
    </div>
  );
};

    