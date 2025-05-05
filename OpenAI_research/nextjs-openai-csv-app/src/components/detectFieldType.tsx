export const detectFieldType = (columnName: string, columnData: string[]) => {
    const lowerName = columnName.toLowerCase();
    const sampleData = columnData.slice(0, 10).filter(Boolean);
  
    // Gender detection
    const genderKeywords = ['gender', 'sex'];
    const genderOptions = ['male', 'female', 'non-binary', 'other', 'prefer not to say'];
  
    const isGenderColumn =
      genderKeywords.some((keyword) => lowerName.includes(keyword)) ||
      sampleData.every((val) => genderOptions.some((opt) => val.toLowerCase().includes(opt)));
  
    if (isGenderColumn) {
      return { type: 'radio', options: genderOptions };
    }
  
    // Default to text
    return { type: 'text' };
  };