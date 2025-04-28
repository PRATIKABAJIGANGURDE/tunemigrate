
import { usePlaylistState } from "./playlist/usePlaylistState";
import { usePlaylistExtraction } from "./playlist/usePlaylistExtraction";
import { usePlaylistNaming } from "./playlist/usePlaylistNaming";
import { usePlaylistMatching } from "./playlist/usePlaylistMatching";
import { usePlaylistCreation } from "./playlist/usePlaylistCreation";

export const usePlaylistConversion = () => {
  // Initialize state management
  const [state, actions] = usePlaylistState();
  
  // Initialize feature-specific hooks
  const extraction = usePlaylistExtraction(state, actions);
  const naming = usePlaylistNaming(state, actions);
  const matching = usePlaylistMatching(state, actions);
  const creation = usePlaylistCreation(state, actions);
  
  return {
    ...state,
    ...extraction,
    ...naming,
    ...matching,
    ...creation,
    handleUrlSubmit: extraction.extractPlaylist
  };
};
