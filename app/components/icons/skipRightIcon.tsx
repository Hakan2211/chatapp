export interface SkipRightIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Optional CSS class name to style the icon.
   */
  className?: string;
}

export const SkipRightIcon: React.FC<SkipRightIconProps> = ({
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
    <path d="M10.0858 12L5.29289 16.7929L6.70711 18.2071L12.9142 12L6.70711 5.79291L5.29289 7.20712L10.0858 12ZM17 6.00002L17 18H15L15 6.00002L17 6.00002Z" />
  </svg>
);

export default SkipRightIcon;
