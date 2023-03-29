import clsx from 'clsx';

export function Input({className = '', type, variant, ...props}) {
  const variants = {
    search:
      'bg-transparent px-0 py-2 text-heading w-full focus:ring-0 border-x-0 border-t-0 transition border-b-2 border-primary/10 focus:border-primary/90',
    minisearch:
      'bg-transparent text-left transition border-transparent appearance-none px-0 py-1 focus:outline-0 placeholder:text-white text-white',
  };

  const styles = clsx(variants[variant], className);

  return <input type={type} {...props} className={styles} />;
}
