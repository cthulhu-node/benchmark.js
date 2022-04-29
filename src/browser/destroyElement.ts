/**
 * Destroys the given element.
 */
export function destroyElement(element: any, trash: any) {
  trash.appendChild(element);
  trash.innerHTML = '';
}
