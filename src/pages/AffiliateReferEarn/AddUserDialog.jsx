import React, { useState } from "react";
import { Dialog } from "@material-ui/core";

const AddUserDialog = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: "transparent",
          boxShadow: "none",
          overflow: "visible",
        },
      }}
    >
      <div className="z-2 popUpBoxShadow popUpOpenAnimation relative w-full bg-bg_loginPopupBg p-2 xs:p-5 rounded-md bg-[#111] text-white">
        <div
          className="transition-all mb-2 ease-in-out duration-200 hover:scale-105 absolute top-2 right-2 cursor-pointer"
          onClick={onClose}
        >
          <svg
            height="24"
            width="24"
            fill="var(--color-quaternary)"
            aria-hidden="true"
            focusable="false"
            data-prefix="fad"
            data-icon="circle-xmark"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <g className="fa-duotone-group">
              <path
                fill="currentColor"
                d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47z"
              ></path>
              <path
                fill="white"
                d="M209 175c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47z"
              ></path>
            </g>
          </svg>
        </div>
        <div className="flex gap-6 h-max w-full">
          <div title="register" className="flex flex-col gap-y-4 w-full">
            <form className="w-full gap-y-4 flex flex-col" autoComplete="off">
              <div title="signUpForm" className="w-full">
                <div className="flex w-full items-center py-2 bg-bg_BgGray rounded-lg border mt-4 border-[#4c4b4b] bg-[#212121]">
                  <span
                    id="dropdown-phone-button"
                    className="flex-shrink-0 z-10 inline-flex items-center pl-2 pr-1 text-sm sm:text-md font-normal text-center"
                  >
                    +91
                    <div className="relative overflow-hidden w-max h-max ml-1">
                      <span className="f32">
                        <div className="flag in w-full"></div>
                      </span>
                    </div>
                  </span>
                  <input
                    id="mobile-no-input"
                    className="block focus:outline-none w-full font-lato bg-bg_BgGray rounded-none text-text_Ternary pr-2 text-sm xs:text-md bg-transparent text-white"
                    placeholder="895XX6XXXX"
                    inputMode="numeric"
                    autoComplete="off"
                    type="tel"
                    name="mobileNum"
                    maxLength="10"
                  />
                </div>
                <div
                  id="phoneNumberValidations"
                  className="flex w-full items-center justify-between mt-1 px-1"
                >
                  <span className="text-xs text-text_Danger"></span>
                  <span className="text-xs text-text_Primary text-gray-400">
                    0/10
                  </span>
                </div>
                <div className="w-full grid grid-cols-1 xs:grid-cols-1 gap-2 overflow-hidden py-2">
                  <button
                    type="button"
                    className="w-full border min-h-[36px] transition-all ease-in-out text-xs whitespace-nowrap mr-1 py-2 sm:py-2.5 px-3 rounded-md font-medium shadow-sm flex items-center justify-center gap-x-2 active:scale-[0.98] active:opacity-95 cursor-pointer text-text_color_primary2 bg-bg_color_LoginBtnBgColor border-border_color_brand_secondary1 bg-[#212121] border-[#4c4b4b] text-white"
                  >
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--icon-color-secondary)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-[18px] w-[18px]"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </span>
                    <span>WhatsApp OTP</span>
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex w-full items-center justify-between bg-bg_BgGray rounded-lg border p-1 border-[#4c4b4b] bg-[#212121]">
                    <div className="w-full h-full flex items-center justify-start pl-1">
                      <input
                        id="userId"
                        className="block focus:outline-none w-full rounded-none text-text_Ternary px-2 py-1 text-sm xs:text-md font-lato bg-bg_BgGray bg-transparent text-white"
                        placeholder="Enter Username"
                        autoComplete="none"
                        type="text"
                        name="name"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between bg-bg_BgGray rounded-lg p-1 border mt-4 border-[#4c4b4b] bg-[#212121]">
                  <div className="w-full h-full flex items-center justify-start pl-1">
                    <span className="mb-1 py-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        height="16"
                        width="16"
                        fill="var(--color-primary)"
                        viewBox="0 0 50 50"
                      >
                        <path d="M 25 3 C 18.363281 3 13 8.363281 13 15 L 13 20 L 9 20 C 7.300781 20 6 21.300781 6 23 L 6 47 C 6 48.699219 7.300781 50 9 50 L 41 50 C 42.699219 50 44 48.699219 44 47 L 44 23 C 44 21.300781 42.699219 20 41 20 L 37 20 L 37 15 C 37 8.363281 31.636719 3 25 3 Z M 25 5 C 30.566406 5 35 9.433594 35 15 L 35 20 L 15 20 L 15 15 C 15 9.433594 19.433594 5 25 5 Z M 25 30 C 26.699219 30 28 31.300781 28 33 C 28 33.898438 27.601563 34.6875 27 35.1875 L 27 38 C 27 39.101563 26.101563 40 25 40 C 23.898438 40 23 39.101563 23 38 L 23 35.1875 C 22.398438 34.6875 22 33.898438 22 33 C 22 31.300781 23.300781 30 25 30 Z"></path>
                      </svg>
                    </span>
                    <span className="w-full relative h-full">
                      <input
                        id="passwordSignUp"
                        className="block focus:outline-none w-full h-full py-1 rounded-none text-text_Ternary px-2 text-sm xs:text-md font-lato bg-bg_BgGray bg-transparent text-white"
                        placeholder="Password"
                        autoComplete="none"
                        type="password"
                        name="password"
                      />
                    </span>
                  </div>
                  <span className="py-1">
                    <button
                      className="leading-normal relative overflow-hidden transition duration-150 ease-in-out pr-2 flex items-center justify-center cursor-pointer"
                      type="button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        width="24"
                        viewBox="0 0 512 512"
                      >
                        <title>Eye</title>
                        <path
                          d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z"
                          fill="none"
                          stroke="var(--color-primary)"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="32"
                        ></path>
                        <circle
                          cx="256"
                          cy="256"
                          r="80"
                          fill="none"
                          stroke="var(--color-primary)"
                          strokeMiterlimit="10"
                          strokeWidth="32"
                        ></circle>
                      </svg>
                    </button>
                  </span>
                </div>
                <div className="flex w-full items-center justify-between bg-bg_BgGray rounded-lg border p-1 mt-4 border-[#4c4b4b] bg-[#212121]">
                  <div className="w-full h-full flex items-center justify-start pl-1">
                    <span className="mb-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        height="16"
                        width="16"
                        fill="var(--color-primary)"
                        viewBox="0 0 50 50"
                      >
                        <path d="M 25 3 C 18.363281 3 13 8.363281 13 15 L 13 20 L 9 20 C 7.300781 20 6 21.300781 6 23 L 6 47 C 6 48.699219 7.300781 50 9 50 L 41 50 C 42.699219 50 44 48.699219 44 47 L 44 23 C 44 21.300781 42.699219 20 41 20 L 37 20 L 37 15 C 37 8.363281 31.636719 3 25 3 Z M 25 5 C 30.566406 5 35 9.433594 35 15 L 35 20 L 15 20 L 15 15 C 15 9.433594 19.433594 5 25 5 Z M 25 30 C 26.699219 30 28 31.300781 28 33 C 28 33.898438 27.601563 34.6875 27 35.1875 L 27 38 C 27 39.101563 26.101563 40 25 40 C 23.898438 40 23 39.101563 23 38 L 23 35.1875 C 22.398438 34.6875 22 33.898438 22 33 C 22 31.300781 23.300781 30 25 30 Z"></path>
                      </svg>
                    </span>
                    <input
                      id="confirmpasswordSignUp"
                      className="block focus:outline-none w-full rounded-none text-text_Ternary px-2 py-1 text-sm xs:text-md font-lato bg-bg_BgGray bg-transparent text-white"
                      placeholder="Confirm Password"
                      autoComplete="none"
                      type="password"
                      name="conPassword"
                    />
                  </div>
                  <span>
                    <button
                      className="leading-normal relative overflow-hidden transition duration-150 ease-in-out pr-2 flex items-center justify-center cursor-pointer"
                      type="button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        width="24"
                        viewBox="0 0 512 512"
                      >
                        <title>Eye</title>
                        <path
                          d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z"
                          fill="none"
                          stroke="var(--color-primary)"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="32"
                        ></path>
                        <circle
                          cx="256"
                          cy="256"
                          r="80"
                          fill="none"
                          stroke="var(--color-primary)"
                          strokeMiterlimit="10"
                          strokeWidth="32"
                        ></circle>
                      </svg>
                    </button>
                  </span>
                </div>
                <div className="flex w-full items-center justify-between bg-bg_BgGray rounded-lg p-1 border mt-4 border-[#4c4b4b] bg-[#212121]">
                  <div className="w-full h-full flex items-center justify-start pl-1">
                    <span className="mb-1 py-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        height="16"
                        width="16"
                        fill="var(--color-primary)"
                        viewBox="0 0 50 50"
                      >
                        <path d="M 25 3 C 18.363281 3 13 8.363281 13 15 L 13 20 L 9 20 C 7.300781 20 6 21.300781 6 23 L 6 47 C 6 48.699219 7.300781 50 9 50 L 41 50 C 42.699219 50 44 48.699219 44 47 L 44 23 C 44 21.300781 42.699219 20 41 20 L 37 20 L 37 15 C 37 8.363281 31.636719 3 25 3 Z M 25 5 C 30.566406 5 35 9.433594 35 15 L 35 20 L 15 20 L 15 15 C 15 9.433594 19.433594 5 25 5 Z M 25 30 C 26.699219 30 28 31.300781 28 33 C 28 33.898438 27.601563 34.6875 27 35.1875 L 27 38 C 27 39.101563 26.101563 40 25 40 C 23.898438 40 23 39.101563 23 38 L 23 35.1875 C 22.398438 34.6875 22 33.898438 22 33 C 22 31.300781 23.300781 30 25 30 Z"></path>
                      </svg>
                    </span>
                    <span className="w-full relative h-full">
                      <input
                        id="passwordSignUp"
                        className="block focus:outline-none w-full h-full py-1 rounded-none text-text_Ternary px-2 text-sm xs:text-md font-lato bg-bg_BgGray bg-transparent text-white"
                        placeholder="Self Password"
                        autoComplete="none"
                        type="password"
                        name="selfPassword"
                      />
                    </span>
                  </div>
                </div>
                <div title="registerSubmitBtn" className="w-full mt-4">
                  <button
                    type="submit"
                    className="leading-normal relative overflow-hidden transition duration-150 ease-in-out w-full text-text_Quaternary bg-bg_color_LoginBtnBgColor rounded-lg font-medium border text-[12px] xs:text-[15px] py-2 flex items-center justify-center gap-x-2 disabled:bg-bg_RegisterDisabledColor cursor-pointer bg-[#facc16] text-black border-[#facc16]"
                  >
                    <span className="font-lato-bold font-semibold text-base">
                      Submit
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default AddUserDialog;
