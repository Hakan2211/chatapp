// SkipNextIcon.tsx
export interface SkipLeftIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Optional CSS class name to style the icon.
   */
  className?: string;
}

export const SkipLeftIcon: React.FC<SkipLeftIconProps> = ({
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
    <path d="M13.9142 12L18.7071 7.20712L17.2929 5.79291L11.0858 12L17.2929 18.2071L18.7071 16.7929L13.9142 12ZM7 18V6.00001H9V18H7Z" />
  </svg>
);

export default SkipLeftIcon;
