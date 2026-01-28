"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { debounce } from "@/lib/utils/debounce";
import type { Prediction, SelectedPlace } from "@/lib/types";
import { generateScanId } from "@/lib/report/generateScanId";

export default function BusinessSearch() {
  const [inputValue, setInputValue] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchPredictions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(input)}`
      );
      const data = await response.json();
      setPredictions(data.predictions || []);
      setIsOpen(data.predictions?.length > 0);
      setHighlightedIndex(-1);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      setPredictions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(
    debounce((input: string) => {
      fetchPredictions(input);
    }, 250),
    [fetchPredictions]
  );

  useEffect(() => {
    // Don't fetch if we have a selected place (user already selected a business)
    if (selectedPlace && inputValue === selectedPlace.primary_text) {
      return;
    }
    
    if (inputValue.length >= 2) {
      debouncedFetch(inputValue);
    } else {
      setPredictions([]);
      setIsOpen(false);
      setSelectedPlace(null);
    }
  }, [inputValue, debouncedFetch, selectedPlace]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    // Clear selected place if user is typing something different
    if (selectedPlace && value !== selectedPlace.primary_text) {
      setSelectedPlace(null);
    }
    if (!value) {
      setSelectedPlace(null);
    }
  };

  const handleSelect = (prediction: Prediction) => {
    setSelectedPlace(prediction);
    setInputValue(prediction.primary_text);
    setPredictions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    // Prevent autocomplete from re-opening after selection
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || predictions.length === 0) {
      // Navigation happens automatically on selection, so no need to handle Enter here
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev < predictions.length - 1 ? prev + 1 : prev;
          // Scroll highlighted item into view
          setTimeout(() => {
            const element = document.querySelector(
              `[data-prediction-index="${next}"]`
            );
            if (element) {
              element.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
          }, 0);
          return next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : -1;
          // Scroll highlighted item into view
          if (next >= 0) {
            setTimeout(() => {
              const element = document.querySelector(
                `[data-prediction-index="${next}"]`
              );
              if (element) {
                element.scrollIntoView({ block: "nearest", behavior: "smooth" });
              }
            }, 0);
          }
          return next;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < predictions.length) {
          handleSelect(predictions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleGetReport = async () => {
    if (!selectedPlace) return;

    // Generate scan ID
    const scanId = generateScanId();
    
    // Trigger social media search immediately (don't wait for report page)
    // This runs in the background and results will be available when user reaches GBP stage
    fetch('/api/scan/socials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: selectedPlace.primary_text,
        address: selectedPlace.secondary_text,
        scanId,
        websiteUrl: null, // We don't have website yet, but API can still search
      }),
    }).catch(err => {
      console.error('[BUSINESS-SEARCH] Failed to trigger social media search:', err);
      // Don't block navigation if search fails
    });
    
    // Navigate to report page
    const params = new URLSearchParams({
      placeId: selectedPlace.place_id,
      name: selectedPlace.primary_text,
      addr: selectedPlace.secondary_text,
    });
    router.push(`/report/${scanId}?${params.toString()}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-[720px] mx-auto text-left flex flex-col items-start gap-4">
      {/* Search Input Wrapper - relative container for dropdown */}
      <div className="relative inline-block w-full">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 z-10">
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Search className="w-6 h-6" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (predictions.length > 0) setIsOpen(true);
          }}
          placeholder="Find your business name"
          className="h-16 md:h-20 w-full pl-14 pr-5 rounded-[25px] border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 text-lg"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="autocomplete-list"
        />

        {/* Autocomplete Dropdown - Owner.com style: compact, left-aligned, native */}
        {isOpen && predictions.length > 0 && (() => {
          // Group predictions by scope (predictions array is already ordered: local first, then global)
          const localResults: Array<{ prediction: typeof predictions[0]; index: number }> = [];
          const globalResults: Array<{ prediction: typeof predictions[0]; index: number }> = [];
          
          predictions.forEach((prediction, index) => {
            if (prediction.scope === "local") {
              localResults.push({ prediction, index });
            } else {
              globalResults.push({ prediction, index });
            }
          });

          const hasLocal = localResults.length > 0;
          const hasGlobal = globalResults.length > 0;

          return (
            <div
              ref={dropdownRef}
              className="absolute left-0 top-[calc(100%+8px)] w-full z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
            >
              <ul className="max-h-[320px] overflow-y-auto py-1">
                {/* Local results section */}
                {hasLocal && localResults.map(({ prediction, index }) => (
                  <li
                    key={prediction.place_id}
                    data-prediction-index={index}
                    role="option"
                    aria-selected={highlightedIndex === index}
                    onClick={() => handleSelect(prediction)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`cursor-pointer px-4 py-3 text-left transition-colors border-b border-gray-100 ${
                      highlightedIndex === index
                        ? "bg-gray-100"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-[14px] font-medium text-gray-900 leading-5">
                      {prediction.primary_text}
                    </div>
                    {prediction.secondary_text && (
                      <div className="mt-0.5 text-[12px] text-gray-500 leading-4">
                        {prediction.secondary_text}
                      </div>
                    )}
                  </li>
                ))}

                {/* Global results section */}
                {hasGlobal && globalResults.map(({ prediction, index }) => (
                  <li
                    key={prediction.place_id}
                    data-prediction-index={index}
                    role="option"
                    aria-selected={highlightedIndex === index}
                    onClick={() => handleSelect(prediction)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`cursor-pointer px-4 py-3 text-left transition-colors border-b border-gray-100 last:border-b-0 ${
                      highlightedIndex === index
                        ? "bg-gray-100"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-[14px] font-medium text-gray-900 leading-5">
                      {prediction.primary_text}
                    </div>
                    {prediction.secondary_text && (
                      <div className="mt-0.5 text-[12px] text-gray-500 leading-4">
                        {prediction.secondary_text}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}
      </div>
      
      {/* Analyse Button - Below search bar */}
      <button
        onClick={handleGetReport}
        disabled={!selectedPlace}
        className={`h-12 md:h-14 px-8 md:px-10 rounded-[25px] font-medium text-base md:text-lg transition-all flex items-center gap-2 bg-blue-500 text-white ${
          selectedPlace
            ? "hover:bg-blue-600 shadow-md hover:shadow-lg cursor-pointer"
            : "cursor-not-allowed opacity-50"
        }`}
      >
        <Image
          src="/icons/ai icon.svg"
          alt="AI"
          width={20}
          height={20}
          className="md:w-6 md:h-6 brightness-0 invert"
        />
        <span className="whitespace-nowrap">Analyse my business</span>
      </button>
    </div>
  );
}
