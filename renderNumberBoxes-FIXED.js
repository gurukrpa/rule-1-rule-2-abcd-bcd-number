  // ✅ FIXED: Clean number box rendering with proper ABCD/BCD colors
  const renderNumberBoxes = (topicName, dateKey) => {
    // Only show for dates from 5th onward
    const availableDates = Object.keys(allDaysData).sort((a, b) => new Date(a) - new Date(b));
    const dateIndex = availableDates.indexOf(dateKey);
    
    if (dateIndex < 4) return null; // Don't show for first 4 dates

    const currentClicks = clickedNumbers[topicName]?.[dateKey]?.[`HR${activeHR}`] || [];
    const abcdNumbers = abcdBcdAnalysis[topicName]?.[dateKey]?.abcdNumbers || [];
    const bcdNumbers = abcdBcdAnalysis[topicName]?.[dateKey]?.bcdNumbers || [];

    const renderButton = (num) => {
      const isClicked = currentClicks.includes(num);
      const isAbcdNumber = abcdNumbers.includes(num);
      const isBcdNumber = bcdNumbers.includes(num);

      // Define button styles - CLEAN & SIMPLE
      let buttonStyle = '';
      let titleText = '';

      if (isClicked) {
        if (isAbcdNumber) {
          buttonStyle = 'bg-orange-500 text-white border-orange-600 shadow-md scale-105';
          titleText = `ABCD clicked: ${num}`;
        } else if (isBcdNumber) {
          buttonStyle = 'bg-teal-600 text-white border-teal-700 shadow-md scale-105';
          titleText = `BCD clicked: ${num}`;
        } else {
          buttonStyle = 'bg-purple-500 text-white border-purple-600 shadow-md scale-105';
          titleText = `Manual click: ${num}`;
        }
      } else {
        if (isAbcdNumber) {
          buttonStyle = 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200 hover:scale-105';
          titleText = `ABCD available: ${num}`;
        } else if (isBcdNumber) {
          buttonStyle = 'bg-teal-100 text-teal-700 border-teal-300 hover:bg-teal-200 hover:scale-105';
          titleText = `BCD available: ${num}`;
        } else {
          buttonStyle = 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 hover:scale-105';
          titleText = `Manual click: ${num}`;
        }
      }

      return (
        <button
          key={`${topicName}-${dateKey}-${num}`}
          onClick={(e) => handleNumberBoxClick(topicName, dateKey, num, e)}
          className={`w-6 h-6 text-xs font-bold rounded border transition-all transform ${buttonStyle}`}
          disabled={numberBoxLoading}
          title={titleText}
        >
          {num}
        </button>
      );
    };

    return (
      <div className="mt-2 space-y-1">
        {/* Row 1: Numbers 1-6 */}
        <div className="flex gap-1 justify-center">
          {[1, 2, 3, 4, 5, 6].map(renderButton)}
        </div>
        {/* Row 2: Numbers 7-12 */}
        <div className="flex gap-1 justify-center">
          {[7, 8, 9, 10, 11, 12].map(renderButton)}
        </div>
      </div>
    );
  };
