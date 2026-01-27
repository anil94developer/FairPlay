import React, { useEffect, useRef } from "react";

interface CasinoProviderBlockProps {
  handleCasinoSubProviderBlockClick: () => void;
  selected: boolean;
  index: number;
  title: string;
  providerRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  highlighted: boolean;
}

const CasinoProviderBlock: React.FC<CasinoProviderBlockProps> = ({
  handleCasinoSubProviderBlockClick,
  selected,
  index,
  title,
  providerRefs,
  highlighted,
}) => {
  const blockRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    providerRefs.current[title] = blockRef.current;
    return () => {
      delete providerRefs.current[title];
    };
  }, [providerRefs, title]);

  return (
    <div
      ref={blockRef}
      onClick={handleCasinoSubProviderBlockClick}
      className={[
        "casino-provider-block",
        selected ? "selected" : "",
        highlighted && !selected ? "highlighted" : "",
        index === 0 ? "first-child" : "",
        title?.toLowerCase().includes("matka") ? "" : "",
      ].join(" ")}
    >
      <div className="casino-filter-text">{title}</div>
    </div>
  );
};

export default CasinoProviderBlock;
