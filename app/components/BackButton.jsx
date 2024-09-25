import {
  Icon,
} from "@shopify/polaris";
import { ArrowLeftIcon } from '@shopify/polaris-icons';

export const BackButton = ({ onClick }) => {
  return (
    <button onClick={onClick}>
      <Icon source={ArrowLeftIcon} color="inkLighter" />
    </button>
  );
}