// BoltIcon.tsx
export interface PulseLineIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Optional CSS class name to style the icon.
   */
  className?: string;
}

export const PulseLineIcon: React.FC<PulseLineIconProps> = ({
  className,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M9 7.53861L15 21.5386L18.6594 13H23V11H17.3406L15 16.4614L9 2.46143L5.3406 11H1V13H6.6594L9 7.53861Z" />
  </svg>
);

export default PulseLineIcon;
