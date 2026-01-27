import React from "react";
import { Dialog, DialogContent, IconButton } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import afshareimg from "../../assets/af-share-img.svg";

const ShareAffiliateLinkDialog = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth className="affiliate-modal">
      <div>
        <IconButton onClick={onClose}>
          <Close htmlColor="#fff" />
        </IconButton>
      </div>
      <DialogContent>
        <div class="share-link-img-sec">
          <img src={afshareimg} alt="af-share-img" />
        </div>
        <div class="af-share-link-wrapper">
          <p>Share Link</p>
          <div class="af-share-link-sec">
            <span>https://usabet9.com?af_code=sofia292</span>
            <button class="thm-but btn-gradient">Copy</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareAffiliateLinkDialog;
