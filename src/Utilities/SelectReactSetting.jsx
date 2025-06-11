// This object sets custom styles for the react-select dropdown
export const selectCustomStyles = {
  // This function styles each option in the dropdown
  option: (provided, state) => ({
    ...provided, // Keep the default styles
    borderBottom: "1px solid green", // Add a green line under each option
    color: state.isSelected ? "yellow" : "black", // Yellow text if selected, black if not
    backgroundColor: state.isSelected ? "green" : "white", // Green background if selected, white if not
    padding: "0px", // No extra space inside the option
  }),
};
