import React from 'react';

interface CasinoCategoryCardProps {
  category: string;
  handleCasinoCategoryClick: (category: string) => void;
  selected: boolean;
  icon?: string;
  categoryRefs: React.MutableRefObject<{}>;
}

const CasinoCategoryCard: React.FC<CasinoCategoryCardProps> = ({
  category,
  handleCasinoCategoryClick,
  icon,
  selected,
  categoryRefs,
}) => {
  return (
    <div
      ref={(el) => (categoryRefs.current[category] = el)}
      onClick={() => handleCasinoCategoryClick(category)}
      className={`casino-category-card ${selected ? 'selected' : ''}`}
    >
      {icon && (
        <img
          className={`casino-category-icon ${selected ? 'selected' : ''}`}
          src={icon}
          alt="cat-icon"
        />
      )}
      <div className="casino-category-text">{category}</div>
    </div>
  );
};

export default CasinoCategoryCard;
