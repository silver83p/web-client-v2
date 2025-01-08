function createDropdown(element, options, onSelect) {
  // Remove any existing dropdowns
  const existingDropdown = document.querySelector('.dropdown-menu');
  if (existingDropdown) {
    existingDropdown.remove();
  }

  const dropdown = document.createElement('div');
  dropdown.className = 'dropdown-menu';
  
  options.forEach(option => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.textContent = option.label;
    item.onclick = (e) => {
      e.stopPropagation();
      element.value = option.label;
      onSelect(option);
      dropdown.remove();
    };
    dropdown.appendChild(item);
  });

  // Position dropdown relative to input
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  dropdown.style.position = 'fixed';
  dropdown.style.top = `${rect.bottom + scrollTop}px`;
  dropdown.style.left = `${rect.left}px`;
  dropdown.style.width = `${rect.width}px`;
  
  document.body.appendChild(dropdown);

  // Close dropdown when clicking outside
  const closeDropdown = (e) => {
    if (!dropdown.contains(e.target) && e.target !== element) {
      dropdown.remove();
      document.removeEventListener('click', closeDropdown);
    }
  };

  // Add click listener with slight delay to prevent immediate closing
  setTimeout(() => {
    document.addEventListener('click', closeDropdown);
  }, 0);

  // Close dropdown when scrolling
  const scrollHandler = () => {
    dropdown.remove();
    document.removeEventListener('scroll', scrollHandler);
    document.removeEventListener('click', closeDropdown);
  };

  document.addEventListener('scroll', scrollHandler, { passive: true });
}