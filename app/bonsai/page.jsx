"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Award, Check, Palette, Flower, Sparkles, ShoppingBag, Eye } from "lucide-react"
import { useBonsaiPositioning } from "./components/useBonsaiPositioning"
import { getEyeSvg, getMouthSvg } from "./components/bonsaiSvgData"

// Custom Bonsai SVG Component
const BonsaiSVG = ({ treeColor = "#77DD82", potColor = "#FD9475", decorations = [], selectedEyes = "default_eyes", selectedMouth = "default_mouth" }) => {
  // Function to darken a color for shadows
  const darkenColor = (color, percent = 30) => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - percent / 100));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - percent / 100));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - percent / 100));
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  };

  const shadowColor = darkenColor(treeColor, 35);
  const potShadowColor = darkenColor(potColor, 40);

  // Use custom hook for positioning logic
  const { positions } = useBonsaiPositioning(selectedEyes, selectedMouth);
  
  // Get SVG content using utility functions with memoization for performance
  const eyeSvg = useMemo(() => getEyeSvg(selectedEyes), [selectedEyes]);
  const mouthSvg = useMemo(() => getMouthSvg(selectedMouth), [selectedMouth]);

  return (
    <svg width="300" height="300" viewBox="0 0 442 415" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="229.805" cy="403.625" rx="132.695" ry="11.2054" fill="#1D1A2A"/>
      
      {/* Main Pot - using dynamic color */}
      <path d="M137.213 381.804L123.648 330.495C114.684 331.439 112.05 325.384 111.853 322.238V308.084C111.381 299.592 119.52 298.255 123.648 298.648H336.551C345.043 299.12 346.773 304.742 346.577 307.494V321.649C347.049 330.141 338.91 331.085 334.782 330.495L321.807 381.804C318.858 390.061 310.995 393.599 306.473 394.189H301.165C297.863 402.681 290.157 403.625 286.421 403.625C276.514 404.569 273.25 398.121 272.267 394.189H183.214C183.214 397.138 178.142 403.153 169.649 403.625C161.157 404.097 157.068 397.531 156.085 394.189H153.136C144.172 394.661 138.785 386.129 137.213 381.804Z" fill={potColor}/>
      <path d="M123.648 330.495L137.213 381.804C138.785 386.129 144.172 394.661 153.136 394.189H156.085M123.648 330.495H334.782M123.648 330.495C114.684 331.439 112.05 325.384 111.853 322.238V308.084C111.381 299.592 119.52 298.255 123.648 298.648H336.551C345.043 299.12 346.773 304.742 346.577 307.494V321.649C347.049 330.141 338.91 331.085 334.782 330.495M334.782 330.495L321.807 381.804C318.858 390.061 310.995 393.599 306.473 394.189H301.165M156.085 394.189C157.068 397.531 161.157 404.097 169.649 403.625C178.142 403.153 183.214 397.138 183.214 394.189M156.085 394.189H183.214M183.214 394.189H272.267M272.267 394.189C273.25 398.121 276.514 404.569 286.421 403.625C290.157 403.625 297.863 402.681 301.165 394.189M272.267 394.189H301.165" stroke="black" strokeWidth="3.53855" strokeLinecap="round"/>
      
      {/* Dynamic Eyes and Mouth */}
      <g transform={`translate(${positions.eyeCenterX}, 352)`} dangerouslySetInnerHTML={{ __html: eyeSvg }} />
      <g transform={`translate(${positions.mouthCenterX}, 365)`} dangerouslySetInnerHTML={{ __html: mouthSvg }} />
      
      {/* Pot Details and Shading */}
      <path d="M138.624 378.237L129.546 344.059H131.905L137.213 364.701C140.162 376.311 143.409 387.701 150.777 391.83C146.405 390.955 143.329 388.136 141.31 385.054C139.963 382.999 139.255 380.612 138.624 378.237Z" fill="#FBF3CC" stroke="#FBF3CC" strokeWidth="1.17952"/>
      <path d="M298.711 344.295H129.554L126.597 332.264H331.833L321.217 375.317C320.038 387.112 311.526 391.016 307.583 392.42H277.419C290.972 387.025 294.545 367.3 298.666 344.547L298.711 344.295Z" fill={potShadowColor} stroke={potShadowColor} strokeWidth="1.17952"/>
      <path d="M115.981 308.674L115.982 326.367C114.802 325.777 114.212 324.008 114.212 319.879V305.725C114.212 303.366 116.571 300.889 118.93 300.417H307.653L296.565 302.828C294.919 303.186 293.239 303.366 291.554 303.366H127.777C115.392 302.954 115.981 306.315 115.981 308.674Z" fill="#FBF3CC" stroke="#FBF3CC" strokeWidth="1.17952"/>
      <path d="M288.781 328.726C312.961 322.828 309.422 315.161 307.995 300.417H338.822C341.193 300.417 345.343 304.031 344.75 308.85V324.597C344.16 328.136 341.269 328.726 338.822 328.726H288.781Z" fill={potShadowColor} stroke={potShadowColor} strokeWidth="1.17952"/>
      <path d="M127.777 315.297C127.777 312.291 130.214 309.853 133.221 309.853H136.487C139.494 309.853 141.931 312.291 141.931 315.297V315.297C141.931 318.304 139.494 320.741 136.487 320.741H133.221C130.214 320.741 127.777 318.304 127.777 315.297V315.297Z" fill="#FBF3CC"/>
      <circle cx="156.085" cy="315.751" r="3.53855" fill="#FBF3CC"/>
      
      {/* Main Tree Foliage - using dynamic color */}
      <path d="M321.217 297.469H136.623C154.316 277.417 168.47 283.314 172.008 289.212C175.547 279.776 188.325 277.81 193.24 277.417C213.056 274.586 226.659 286.067 230.984 292.161C246.554 279.422 261.848 282.921 267.549 286.263C267.549 279.658 276.592 277.613 281.114 277.417C294.796 276.945 295.858 283.118 294.678 286.263C309.304 283.904 318.465 292.751 321.217 297.469Z" fill={treeColor} stroke="black" strokeWidth="3.53855"/>
      
      {/* Tree Highlights and Details */}
      <path d="M173.452 292.189C180.265 286.853 195.009 278.007 213.881 281.657C202.585 276.976 176.424 278.146 173.452 292.189Z" fill="#FBF3CC"/>
      <path d="M166.701 287.443C159.624 282.135 146.687 290.234 141.931 295.11H148.418C150.187 291.571 160.213 287.443 166.701 287.443Z" fill="#FBF3CC"/>
      <path d="M173.452 292.189C180.265 286.853 195.009 278.007 213.881 281.657C202.585 276.976 176.424 278.146 173.452 292.189Z" stroke="#FBF3CC" strokeWidth="1.17952"/>
      <path d="M166.701 287.443C159.624 282.135 146.687 290.234 141.931 295.11H148.418C150.187 291.571 160.213 287.443 166.701 287.443Z" stroke="#FBF3CC" strokeWidth="1.17952"/>
      <path d="M213.881 282.244C208.22 289.094 196.548 292.161 192.42 295.11H316.499C309.894 286.302 296.841 286.729 291.14 287.748C295.268 280.955 288.191 280.366 287.601 280.366C285.832 282.2 279.344 284.69 268.729 288.972C268.139 290.195 242.779 293.253 229.805 294.476C227.918 289.094 218.403 284.079 213.881 282.244Z" fill={shadowColor} stroke={shadowColor} strokeWidth="1.17952"/>
      
      {/* Detailed Trunk and Branches */}
      <path d="M202.691 276.827C205.247 273.288 209.179 260.904 191.486 255.596C186.18 254.535 177.859 250.184 174.235 238.666C162.805 228.425 135.444 236.724 124.238 239.083C109.627 242.159 98.0922 228.779 94.1605 220.21H107.135C111.381 230.59 124.631 227.681 130.725 224.928C149.598 215.02 166.489 218.834 172.576 221.98C172.895 217.001 173.827 211.329 175.547 204.877C177.805 196.405 187.932 186.004 199.727 183.056C209.687 180.566 222.625 175.153 222.153 164.773C222.062 163.309 221.851 160.909 221.509 158.286C187.508 155.455 180.239 140.986 180.855 134.106H192.06C195.363 145.429 211.422 147.474 219.038 147.08C217.912 143.249 216.673 137.536 217.435 134.106H239.846C238.994 137.516 239.51 142.432 241.198 148.26C246.443 149.046 259.057 147.316 267.549 134.106H278.755C279.908 139.217 274.851 151.445 245.394 159.465C246.846 162.699 248.542 166.063 250.462 169.491C256.949 184.825 248.477 192.437 229.215 203.107C223.892 206.056 215.651 211.954 216.24 221.98C216.24 228.69 227.6 234.602 236.882 238.666C253.395 215.686 283.669 220.719 297.627 226.108C321.217 239.79 335.371 231.416 337.141 226.108H350.705C338.91 248.519 312.371 246.16 301.165 241.442C272.857 229.175 259.489 241.576 256.344 249.311C263.087 255.18 270.735 264.946 272.283 279.186C270.907 280.366 268.036 283.432 267.565 286.263C261.667 283.118 246.333 279.894 232.179 292.161C228.247 287.836 216.846 278.714 202.691 276.827Z" fill="#BA6E5C"/>
      <path d="M256.344 249.311C252.81 246.235 249.525 244.229 247.498 243.211C245.547 242.231 241.468 240.674 236.882 238.666M256.344 249.311C263.087 255.18 270.735 264.946 272.283 279.186C270.907 280.366 268.036 283.432 267.565 286.263C261.667 283.118 246.333 279.894 232.179 292.161C228.247 287.836 216.846 278.714 202.691 276.827C205.247 273.288 209.179 260.904 191.486 255.596C186.18 254.535 177.859 250.184 174.235 238.666M256.344 249.311C259.489 241.576 272.857 229.175 301.165 241.442C312.371 246.16 338.91 248.519 350.705 226.108H337.141C335.371 231.416 321.217 239.79 297.627 226.108C283.669 220.719 253.395 215.686 236.882 238.666M236.882 238.666C227.6 234.602 216.24 228.69 216.24 221.98C215.651 211.954 223.892 206.056 229.215 203.107C248.477 192.437 256.949 184.825 250.462 169.491C248.542 166.063 246.846 162.699 245.394 159.465M172.576 221.98C172.895 217.001 173.827 211.329 175.547 204.877C177.805 196.405 187.932 186.004 199.727 183.056C209.687 180.566 222.625 175.153 222.153 164.773C222.062 163.309 221.851 160.909 221.509 158.286M172.576 221.98C166.489 218.834 149.598 215.02 130.725 224.928C124.631 227.681 111.381 230.59 107.135 220.21H94.1605C98.0922 228.779 109.627 242.159 124.238 239.083C135.444 236.724 162.805 228.425 174.235 238.666M172.576 221.98C172.142 228.748 172.841 234.237 174.235 238.666M241.198 148.26C239.51 142.432 238.994 137.516 239.846 134.106H217.435C216.673 137.536 217.912 143.249 219.038 147.08M241.198 148.26C246.443 149.046 259.057 147.316 267.549 134.106H278.755C279.908 139.217 274.851 151.445 245.394 159.465M241.198 148.26C242.199 151.716 243.611 155.492 245.394 159.465M219.038 147.08C219.306 147.992 219.568 148.797 219.794 149.439C220.551 151.962 221.117 155.271 221.509 158.286M219.038 147.08C211.422 147.474 195.363 145.429 192.06 134.106H180.855C180.239 140.986 187.508 155.455 221.509 158.286" stroke="black" strokeWidth="3.53855"/>
      
      {/* Additional trunk details */}
      <path d="M205.797 184.215C181.226 191.03 177.452 206.57 174.368 224.339C174.957 205.466 181.445 196.62 187.932 191.312C196.778 183.056 224.497 183.056 224.497 162.414C226.125 172.724 217.767 178.541 209.99 182.62C208.663 183.316 207.241 183.815 205.797 184.215Z" fill="#FADFB6"/>
      <path d="M239.831 237.903C247.891 230.826 270.498 220.8 297.627 228.467C284.062 223.159 258.113 217.851 239.831 237.903Z" fill="#FADFB6"/>
      <path d="M189.701 204.877C183.214 218.441 183.214 232.595 193.24 244.39C188.522 239.672 177.906 225.518 189.701 204.877Z" fill="#FADFB6"/>
      <path d="M205.797 184.215C181.226 191.03 177.452 206.57 174.368 224.339C174.957 205.466 181.445 196.62 187.932 191.312C196.778 183.056 224.497 183.056 224.497 162.414C226.125 172.724 217.767 178.541 209.99 182.62C208.663 183.316 207.241 183.815 205.797 184.215Z" stroke="#FADFB6" strokeWidth="1.17952"/>
      <path d="M239.831 237.903C247.891 230.826 270.498 220.8 297.627 228.467C284.062 223.159 258.113 217.851 239.831 237.903Z" stroke="#FADFB6" strokeWidth="1.17952"/>
      <path d="M189.701 204.877C183.214 218.441 183.214 232.595 193.24 244.39C188.522 239.672 177.906 225.518 189.701 204.877Z" stroke="#FADFB6" strokeWidth="1.17952"/>
      
      {/* Complex trunk patterns */}
      <path d="M240.42 180.697C244.549 160.645 233.343 159.465 224.497 161.824C224.497 155.927 219.779 143.542 219.189 135.875H237.472C234.523 147.08 253.395 175.979 250.446 178.927C250.918 188.835 235.702 197.996 228.035 201.338C213.409 208.887 213.291 220.21 215.061 224.928C221.666 232.477 239.831 242.228 248.087 246.16C262.713 253.237 268.729 270.34 269.908 278.007C269.436 278.478 266.959 281.742 265.78 283.314C265.308 282.371 258.899 281.545 255.754 280.955C248.498 279.919 238.66 284.608 233.047 287.933C232.392 288.377 231.705 288.803 230.984 289.212C231.58 288.824 232.273 288.392 233.047 287.933C248.455 277.497 245.766 257.935 239.241 253.237C231.869 247.929 224.497 247.657 212.702 234.954C205.035 226.698 205.821 218.441 206.804 215.492C209.753 198.389 235.702 193.671 240.42 180.697Z" fill="#A94C60"/>
      
      {/* Hair/Head details */}
      <path d="M246.318 157.106L243.959 150.619C256.698 150.619 265.78 140.79 268.729 135.875H276.985C273.211 148.142 254.968 155.14 246.318 157.106Z" fill="#A94C60"/>
      <path d="M219.189 156.517C219.189 156.517 218.01 151.012 217.42 148.85C199.019 149.321 192.06 140.396 190.881 135.875H182.624C186.399 150.501 208.377 155.73 219.189 156.517Z" fill="#A94C60"/>
      
      {/* More detailed features */}
      <path d="M215.061 278.007C219.307 261.493 197.171 253.04 185.573 250.878C209.635 258.898 208.967 270.34 205.625 275.058L215.061 278.007Z" fill="#A94C60"/>
      <path d="M170.829 233.775L170.239 229.057C161.983 223.749 142.521 223.159 131.315 226.698C115.746 234.247 107.921 226.698 105.956 221.98H97.1093C107.961 238.021 120.503 238.493 125.418 236.724C154.198 228.703 167.684 231.219 170.829 233.775Z" fill="#A94C60"/>
      <path d="M310.012 234.365C276.985 224.928 255.361 235.151 248.677 241.442L255.754 246.16C272.267 222.569 302.935 240.852 312.371 242.621C330.771 244.98 343.235 234.168 347.166 228.467H338.32C332.658 236.959 317.089 235.937 310.012 234.365Z" fill="#A94C60"/>
      
      {/* Main body stroke outline */}
      <path d="M224.497 161.824C233.343 159.465 244.549 160.645 240.42 180.697C235.702 193.671 209.753 198.389 206.804 215.492C205.821 218.441 205.035 226.698 212.702 234.954C224.497 247.657 231.869 247.929 239.241 253.237C246.043 258.134 248.677 279.186 230.984 289.212C235.899 286.01 247.497 279.776 255.754 280.955C258.899 281.545 265.308 282.371 265.78 283.314C266.959 281.742 269.436 278.478 269.908 278.007C268.729 270.34 262.713 253.237 248.087 246.16C239.831 242.228 221.666 232.477 215.061 224.928C213.291 220.21 213.409 208.887 228.035 201.338C235.702 197.996 250.918 188.835 250.446 178.927C253.395 175.979 234.523 147.08 237.472 135.875H219.189C219.779 143.542 224.497 155.927 224.497 161.824Z" stroke="#AE677B" strokeWidth="1.17952"/>
      
      {/* Complex stroke details */}
      <path d="M247.035 241.666C247.343 241.91 247.652 242.153 247.96 242.397C248.189 242.098 248.442 241.785 248.689 241.492C253.299 236.243 259.336 231.659 266.389 230.578C266.778 230.524 267.168 230.484 267.561 230.457C267.553 230.31 267.545 230.163 267.538 230.015C267.134 230.03 266.732 230.06 266.331 230.102C259.042 230.999 252.756 235.471 247.828 240.741C247.561 241.038 247.286 241.357 247.035 241.666Z" fill="black"/>
      <path d="M214.844 277.371C214.989 277.402 215.133 277.432 215.277 277.462C215.488 276.699 215.622 275.911 215.69 275.107C215.959 271.92 215.19 268.649 213.677 265.819C208.053 255.658 196.193 251.863 185.582 250.356C184.82 250.251 184.04 250.155 183.242 250.069C183.223 250.215 183.204 250.361 183.186 250.507C183.975 250.626 184.746 250.752 185.498 250.887C196.001 252.792 207.385 256.808 212.636 266.374C214.058 269.042 214.929 272.03 214.983 275.082C214.994 275.852 214.953 276.616 214.844 277.371Z" fill="black"/>
      <path d="M212.21 252.449C212.796 252.686 213.399 252.976 213.959 253.276C216.242 254.506 218.304 256.136 220.074 258.037C226.42 264.616 228.853 274.602 226.419 283.293C226.26 283.915 226.087 284.521 225.889 285.145C225.747 285.104 225.605 285.063 225.463 285.022C225.627 284.397 225.768 283.792 225.895 283.173C227.846 274.504 225.287 265.177 219.21 258.84C217.509 257.014 215.64 255.337 213.587 253.879C213.084 253.521 212.541 253.164 212.013 252.845C212.079 252.714 212.144 252.581 212.21 252.449Z" fill="black"/>
      <path d="M221.098 241.86C221.005 241.974 220.912 242.088 220.818 242.203C221.54 242.857 222.308 243.462 223.105 244.024C226.304 246.275 229.903 247.853 233.478 249.288C236.361 250.467 239.34 251.508 241.872 253.123C250.043 258.971 255.993 268.903 255.289 279.249C255.228 280.198 255.114 281.144 254.947 282.093C255.092 282.121 255.237 282.149 255.381 282.177C255.584 281.218 255.731 280.259 255.825 279.292C256.872 268.713 251.006 258.339 242.507 252.171C239.773 250.405 236.8 249.378 233.917 248.193C230.349 246.76 226.78 245.364 223.489 243.43C222.669 242.946 221.868 242.426 221.098 241.86Z" fill="black"/>
      <path d="M238.241 162.874C238.121 162.961 238.002 163.047 237.882 163.133C238.7 164.35 239.36 165.681 239.837 167.06C241.846 172.627 240.359 178.838 236.955 183.54C232.631 189.603 226.179 193.842 219.53 197.312L219.505 197.325C207.779 203.539 200.056 220.191 209.172 231.541C210.013 232.784 210.932 233.952 211.945 235.099C212.056 235.003 212.168 234.906 212.279 234.81C211.302 233.654 210.421 232.483 209.62 231.244C200.995 219.927 208.653 204.303 220.053 198.274L220.028 198.287C226.786 194.817 233.394 190.552 237.921 184.216C241.501 179.318 242.925 172.494 240.499 166.81C239.927 165.401 239.162 164.066 238.241 162.874Z" fill="black"/>
      <path d="M198.099 196.201C198.005 196.087 197.911 195.973 197.817 195.86C197.07 196.414 196.325 197.016 195.607 197.643C192.748 200.141 190.225 203.034 188.157 206.239C180.219 217.084 181.045 233.888 191.566 242.661C192.248 243.315 192.936 243.93 193.685 244.558C193.781 244.446 193.878 244.335 193.974 244.223C193.255 243.577 192.596 242.947 191.944 242.279C181.927 233.218 181.496 217.493 189.149 206.878C191.162 203.759 193.494 200.843 196.093 198.157C196.747 197.483 197.423 196.824 198.099 196.201Z" fill="black"/>
      <path d="M222.927 138.728C222.899 138.677 222.854 138.638 222.799 138.619C222.745 138.601 222.685 138.604 222.634 138.629C222.582 138.654 222.542 138.699 222.523 138.753C222.503 138.808 222.506 138.867 222.529 138.92C222.529 138.92 222.529 138.92 222.529 138.92C222.948 139.9 223.355 140.899 223.74 141.895C225.28 145.89 226.533 149.981 227.352 154.153C231.357 168.732 222.767 185.29 207.511 188.504C206.476 188.813 205.479 189.076 204.399 189.327C204.342 189.34 204.292 189.375 204.261 189.424C204.229 189.473 204.218 189.532 204.231 189.589C204.243 189.646 204.277 189.696 204.326 189.728C204.375 189.759 204.435 189.771 204.492 189.759C204.492 189.759 204.492 189.759 204.492 189.759C205.588 189.539 206.603 189.304 207.657 189.021C214.92 187.124 222.109 183.064 225.928 176.258C229.8 169.509 229.968 161.328 228.51 153.927C227.672 149.656 226.236 145.526 224.39 141.616C223.929 140.641 223.438 139.671 222.927 138.728Z" fill="black"/>

      {/* Foliage 1 main */}
      <path d="M35.1847 167.132C25.2768 160.527 21.6203 169.884 21.0305 175.389C7.34812 180.107 2.35484 190.722 2.15826 196.03C0.271037 210.656 15.7227 219.621 23.9793 220.21H128.956C162.454 219.267 165.325 198.586 162.572 188.363C156.439 166.66 136.82 163.987 127.777 165.363C130.136 136.583 100.648 125.849 83.5448 125.849C44.6208 128.208 35.5779 154.944 35.1847 167.132Z" fill={treeColor} stroke="black" strokeWidth="3.53855"/>
      
      {/* Foliage 1 circles */}
      <path d="M59.3648 175.389C59.3648 177.994 57.2524 180.107 54.6467 180.107C52.041 180.107 49.9286 177.994 49.9286 175.389C49.9286 172.783 52.041 170.671 54.6467 170.671C57.2524 170.671 59.3648 172.783 59.3648 175.389Z" fill="#FDFDF2"/>
      <circle cx="132.495" cy="183.645" r="4.71806" fill="#FDFDF2"/>
      <circle cx="96.5195" cy="152.388" r="5.30782" fill="#FDFDF2"/>
      <circle cx="104.186" cy="162.414" r="3.53855" fill="#FDFDF2"/>
      <circle cx="30.4667" cy="191.312" r="4.1283" fill="#FDFDF2"/>
      
      {/* Foliage 1 shadows */}
      <path d="M37.5438 181.876C19.2613 178.337 10.4149 190.133 4.51733 196.62C5.69685 184.825 18.0818 178.338 22.7998 177.158C24.5691 161.824 32.8257 168.312 36.954 170.671C40.4925 122.311 95.9298 122.9 111.853 136.465C64.6726 124.08 38.5267 161.235 37.5438 181.876Z" fill="#F6FAD5" stroke="#F6FAD5" strokeWidth="1.17952"/>
      <path d="M49.3389 202.518C19.6151 205.348 7.26952 200.552 4.51732 197.21C2.74801 205.466 13.3637 219.621 26.9281 217.851H138.982C150.187 216.672 172.009 201.338 154.316 177.158C153.136 202.518 122.469 204.877 111.263 202.518C105.366 211.364 95.9298 207.236 92.3913 202.518H59.3648C60.3084 197.799 56.6126 196.227 54.6467 196.03C48.5132 195.087 48.5525 199.962 49.3389 202.518Z" fill={shadowColor} stroke={shadowColor} strokeWidth="1.17952"/>
      
      {/* Foliage 1 leaves curve */}
      <path d="M92.4558 198.979C92.0626 201.535 93.2814 206.882 101.302 207.825C104.054 208.219 109.913 207.236 111.328 200.159" stroke="black" strokeWidth="3.53855" strokeLinecap="round"/>

      {/* Foliage 2 main */}
      <path d="M105.704 102.849C101.457 77.8429 130.136 64.7109 144.29 61.5655C140.515 54.0167 143.7 48.7874 146.059 46.8216C151.721 42.1035 160.213 46.8216 161.983 49.7704C175.193 11.5541 209.163 2 224.497 2C278.165 2.58976 287.601 48.0012 287.011 43.2831C286.421 38.5651 303.585 34.8732 306.473 48.5908C308.832 59.7962 302.345 59.2065 297.627 62.745C317.089 62.745 351.295 75.7197 347.166 102.849C343.864 124.552 320.627 132.336 309.422 133.516H142.858C132.243 133.713 109.95 127.854 105.704 102.849Z" fill={treeColor} stroke="black" strokeWidth="3.53855"/>
      
      {/* Foliage 2 circles */}
      <circle cx="247.497" cy="36.7957" r="6.48733" fill="#FDFDF2"/>
      <circle cx="189.701" cy="73.3607" r="5.30782" fill="#FDFDF2"/>
      <circle cx="261.062" cy="46.8216" r="3.53855" fill="#FDFDF2"/>
      
      {/* Foliage 2 shadows */}
      <path d="M162.572 70.4119C123.151 64.2876 111.731 86.5465 107.725 96.3611C108.904 76.3094 134.854 65.6939 147.239 62.7451C136.033 43.2831 157.854 43.283 162.572 54.4885C184.393 -6.25668 239.241 0.230648 258.703 13.2053C199.727 -4.48741 168.381 42.7346 162.572 70.4119Z" fill="#F6FAD5" stroke="#F6FAD5" strokeWidth="1.17952" strokeLinecap="round"/>
      <path d="M163.088 111.105C128.692 116.295 113.615 104.618 107.725 98.7202C108.903 122.311 130.695 130.567 140.118 131.747H309.742C356.859 119.362 348.346 86.3353 332.423 76.3094C332.423 107.567 293.447 113.268 277.348 112.285C270.87 122.311 262.035 117.003 259.09 112.285L206.083 111.105C203.138 102.259 193.126 107.567 193.126 111.105H178.99C174.868 117.592 166.033 114.054 163.088 111.105Z" fill={shadowColor} stroke={shadowColor} strokeWidth="1.17952"/>
      <path d="M265.19 72.1812C275.216 50.9499 301.165 56.2577 302.935 45.6421C308.832 59.7963 298.806 56.7062 292.909 63.7833C286.303 61.896 271.678 68.8392 265.19 72.1812Z" fill={shadowColor} stroke={shadowColor} strokeWidth="1.17952"/>
      
      {/* Foliage 2 leaves curve */}
      <path d="M161.983 106.387C161.589 108.943 162.808 114.29 170.829 115.233C173.581 115.627 179.439 114.644 180.855 107.567" stroke="black" strokeWidth="3.53855" strokeLinecap="round"/>
      <path d="M258.767 109.336C258.374 111.892 259.593 117.239 267.614 118.182C270.366 118.575 276.224 117.593 277.64 110.515" stroke="black" strokeWidth="3.53855" strokeLinecap="round"/>
      
      {/* Foliage 3 main */}
      <path d="M301.755 158.875C298.217 162.414 300.576 166.542 303.524 169.491C296.447 169.491 291.14 171.199 287.011 173.619C269.908 183.645 270.301 199.765 272.267 206.056C274.155 216.908 289.37 224.339 297.037 225.518H414.399C431.856 224.103 438.186 211.954 439.169 206.056C443.887 185.297 427.374 177.355 418.527 175.978C422.302 172.676 422.852 170.277 422.655 169.491C423.127 160.527 413.809 162.611 409.091 164.773C397.768 133.634 374.099 127.815 363.68 128.798C329.238 131.157 316.303 151.798 314.14 161.824C308.478 154.747 304.001 156.63 301.755 158.875Z" fill={treeColor} stroke="black" strokeWidth="3.53855"/>
      
      {/* Foliage 3 circles */}
      <circle cx="376.065" cy="159.465" r="6.48733" fill="#FDFDF2"/>
      <circle cx="334.782" cy="171.26" r="5.30782" fill="#FDFDF2"/>
      <circle cx="295.858" cy="190.133" r="5.30782" fill="#FDFDF2"/>
      <circle cx="387.27" cy="167.132" r="3.53855" fill="#FDFDF2"/>
      
      {/* Foliage 3 shadows */}
      <path d="M273.568 194.681L273.447 194.851C275.806 184.235 287.601 169.604 307.063 171.373C294.088 161.937 307.063 151.911 314.73 166.655C312.961 148.962 356.603 116.413 387.27 138.234C343.038 128.798 318.858 158.875 315.909 176.568C291.153 170.056 279.504 186.369 273.568 194.681Z" fill="#F6FAD5" stroke="#F6FAD5" strokeWidth="1.17952"/>
      <path d="M431.867 183.771C434.049 185.486 435.982 188.512 437.194 192.13C438.41 195.758 438.921 200.04 438.203 204.311C437.484 208.588 435.531 212.854 431.829 216.424C428.128 219.992 422.709 222.836 415.102 224.328L415.047 224.339H297.551L297.478 224.32C292.503 223.026 285.303 220.012 279.866 215.15C274.411 210.272 270.683 203.476 272.875 194.708L274.033 194.786C274.298 197.168 276.407 200.734 282.215 203.198C287.931 205.623 297.191 206.953 311.599 204.976C311.134 203.122 311.726 201.518 312.889 200.327C314.168 199.018 316.114 198.218 318.062 198.023C320.009 197.829 322.065 198.229 323.531 199.458C324.906 200.61 325.67 202.414 325.426 204.877H376.655V205.467C376.655 207.319 377.615 209.088 379.18 210.513C380.744 211.937 382.871 212.976 385.087 213.363C387.301 213.75 389.563 213.479 391.433 212.344C393.292 211.215 394.832 209.189 395.541 205.93L395.654 205.408L396.185 205.47C401.057 206.044 408.725 204.635 415.709 201.078C422.687 197.523 428.868 191.883 430.932 184.084L431.162 183.218L431.867 183.771Z" fill={shadowColor}/>
      
      {/* Foliage 3 leaves curve */}
      <path d="M376.719 204.877C376.326 207.432 377.545 212.779 385.565 213.723C388.317 214.116 394.176 213.133 395.591 206.056" stroke="black" strokeWidth="3.53855" strokeLinecap="round"/>

      {/* Decorations */}
      {decorations.includes("stone-lantern") && (
        <g>
          <rect x="350" y="350" width="20" height="40" fill="#d3d3d3"/>
          <rect x="348" y="348" width="24" height="8" fill="#a0a0a0" rx="2"/>
        </g>
      )}

      {decorations.includes("moss") && (
        <ellipse cx="230" cy="320" rx="60" ry="8" fill="#7d9f6c" opacity="0.7"/>
      )}

      {decorations.includes("pebbles") && (
        <g>
          <circle cx="180" cy="340" r="6" fill="#d3d3d3"/>
          <circle cx="170" cy="345" r="4" fill="#a0a0a0"/>
          <circle cx="290" cy="340" r="5" fill="#b5b5b5"/>
          <circle cx="300" cy="345" r="4" fill="#d3d3d3"/>
        </g>
      )}

      {decorations.includes("miniature-bench") && (
        <g>
          <rect x="320" y="360" width="30" height="12" fill="#8B5E3C"/>
          <rect x="320" y="360" width="30" height="3" fill="#a67c52"/>
          <rect x="325" y="372" width="4" height="8" fill="#8B5E3C"/>
          <rect x="341" y="372" width="4" height="8" fill="#8B5E3C"/>
        </g>
      )}

      {decorations.includes("koi-pond") && (
        <g>
          <ellipse cx="200" cy="370" rx="40" ry="15" fill="#5b8fb0"/>
          <ellipse cx="190" cy="365" rx="12" ry="4" fill="#f8f7f4"/>
          <ellipse cx="210" cy="372" rx="8" ry="3" fill="#e76f51"/>
        </g>
      )}

      {decorations.includes("bonsai-lights") && (
        <g>
          <circle cx="150" cy="200" r="3" fill="#f9c74f"/>
          <circle cx="300" cy="180" r="3" fill="#f9c74f"/>
          <circle cx="320" cy="220" r="3" fill="#f9c74f"/>
          <circle cx="130" cy="240" r="3" fill="#f9c74f"/>
        </g>
      )}
    </svg>
  )
}

// Bonsai Icon Component
const BonsaiIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22V16M12 16C8 16 6 14 6 12C6 10 8 8 12 8C16 8 18 10 18 12C18 14 16 16 12 16ZM8 6C8 4 10 2 12 2C14 2 16 4 16 6M4 14C4 12 6 10 8 10M20 14C20 12 18 10 16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function BonsaiPage() {
  const [selectedTree, setSelectedTree] = useState("maple")
  const [selectedPot, setSelectedPot] = useState("")
  const [selectedEyes, setSelectedEyes] = useState("default_eyes")
  const [selectedMouth, setSelectedMouth] = useState("default_mouth")
  const [selectedDecorations, setSelectedDecorations] = useState([""])
  const [activeTab, setActiveTab] = useState("customize")
  const [credits, setCredits] = useState(450)
  const [previewItem, setPreviewItem] = useState(null)
  const [shopCategory, setShopCategory] = useState("all")

  // Mock bonsai data
  const bonsaiData = {
    credits: 450,
    level: 3,
    nextLevelCredits: 800,
    trees: [
      { id: "maple", name: "Maple Bonsai", credits: 0, unlocked: true, color: "#77DD82", category: "tree" },
      { id: "pine", name: "Pine Bonsai", credits: 200, unlocked: true, color: "#4a7c59", category: "tree" },
      { id: "cherry", name: "Cherry Blossom", credits: 500, unlocked: false, color: "#e4b1ab", category: "tree" },
      { id: "juniper", name: "Juniper Bonsai", credits: 750, unlocked: false, color: "#5d9e75", category: "tree" },
    ],
    pots: [
      {
        id: "traditional-blue",
        name: "Traditional Blue",
        credits: 0,
        unlocked: true,
        color: "#FD9475",
        category: "pot",
      },
      { id: "ceramic-brown", name: "Ceramic Brown", credits: 100, unlocked: true, color: "#8B5E3C", category: "pot" },
      { id: "glazed-green", name: "Glazed Green", credits: 300, unlocked: true, color: "#4a7c59", category: "pot" },
      { id: "stone-gray", name: "Stone Gray", credits: 400, unlocked: false, color: "#7D7D7D", category: "pot" },
      { id: "premium-gold", name: "Premium Gold", credits: 1000, unlocked: false, color: "#D4AF37", category: "pot" },
    ],
    eyes: [
      { id: "default_eyes", name: "Default Eyes", credits: 0, unlocked: true, category: "eyes" },
      { id: "cry_eyes", name: "Crying Eyes", credits: 50, unlocked: true, category: "eyes" },
      { id: "happy_eyes", name: "Happy Eyes", credits: 100, unlocked: true, category: "eyes" },
      { id: "flat_eyes", name: "Sleepy Eyes", credits: 75, unlocked: true, category: "eyes" },
      { id: "wink_eyes", name: "Winking Eyes", credits: 125, unlocked: true, category: "eyes" },
      { id: "puppy_eyes", name: "Puppy Eyes", credits: 150, unlocked: true, category: "eyes" },
      { id: "female_eyes", name: "Elegant Eyes", credits: 200, unlocked: true, category: "eyes" },
    ],
    mouths: [
      { id: "default_mouth", name: "Default Smile", credits: 0, unlocked: true, category: "mouth" },
      { id: "smile_mouth", name: "Big Smile", credits: 50, unlocked: true, category: "mouth" },
      { id: "kiss_mouth", name: "Kiss", credits: 100, unlocked: true, category: "mouth" },
      { id: "surprised_mouth", name: "Surprised", credits: 75, unlocked: true, category: "mouth" },
      { id: "bone_mouth", name: "Playful", credits: 125, unlocked: true, category: "mouth" },
    ],
    decorations: [],
    milestones: [
      { level: 1, name: "Seedling", credits: 0, description: "You've started your bonsai journey" },
      { level: 2, name: "Sapling", credits: 200, description: "Your bonsai is growing steadily" },
      { level: 3, name: "Young Tree", credits: 400, description: "Your bonsai is developing character" },
      { level: 5, name: "Mature Tree", credits: 800, description: "Your bonsai shows signs of wisdom" },
      { level: 10, name: "Ancient Bonsai", credits: 2000, description: "Your bonsai has reached legendary status" },
    ],
    shopItems: [],
  }

  // Combine all items for the shop
  const allShopItems = [
    ...bonsaiData.trees.filter((item) => !item.unlocked).map((item) => ({ ...item, type: "tree" })),
    ...bonsaiData.pots.filter((item) => !item.unlocked).map((item) => ({ ...item, type: "pot" })),
    ...bonsaiData.eyes.filter((item) => !item.unlocked).map((item) => ({ ...item, type: "eyes" })),
    ...bonsaiData.mouths.filter((item) => !item.unlocked).map((item) => ({ ...item, type: "mouth" })),
    ...bonsaiData.decorations.filter((item) => !item.unlocked).map((item) => ({ ...item, type: "decoration" })),
  ]

  const toggleDecoration = (id) => {
    if (selectedDecorations.includes(id)) {
      setSelectedDecorations(selectedDecorations.filter((item) => item !== id))
    } else {
      setSelectedDecorations([...selectedDecorations, id])
    }
  }

  const getTreeColor = () => {
    if (previewItem && previewItem.type === "tree") {
      return previewItem.color
    }
    const tree = bonsaiData.trees.find((t) => t.id === selectedTree)
    return tree ? tree.color : "#77DD82"
  }

  const getPotColor = () => {
    if (previewItem && previewItem.type === "pot") {
      return previewItem.color
    }
    const pot = bonsaiData.pots.find((p) => p.id === selectedPot)
    return pot ? pot.color : "#FD9475"
  }

  const getActiveDecorations = () => {
    let decorations = [...selectedDecorations]
    if (previewItem && previewItem.type === "decoration") {
      if (!decorations.includes(previewItem.id)) {
        decorations.push(previewItem.id)
      }
    }
    return decorations
  }

  // Calculate progress to next level
  const currentLevelMilestone = bonsaiData.milestones.find((m) => m.level === bonsaiData.level)
  const nextLevelMilestone = bonsaiData.milestones.find((m) => m.level > bonsaiData.level)

  const progressToNextLevel =
    currentLevelMilestone && nextLevelMilestone
      ? ((bonsaiData.credits - currentLevelMilestone.credits) /
          (nextLevelMilestone.credits - currentLevelMilestone.credits)) *
        100
      : 0

  const purchaseItem = (item) => {
    if (credits >= item.credits) {
      setCredits(credits - item.credits)
      // Here you would typically add the item to the user's inventory
      alert(`Successfully purchased ${item.name}!`)
    } else {
      alert("Not enough credits to purchase this item!")
    }
  }

  const previewShopItem = (item) => {
    setPreviewItem(item)
  }

  const clearPreview = () => {
    setPreviewItem(null)
  }

  const filteredShopItems =
    shopCategory === "all"
      ? allShopItems
      : allShopItems.filter((item) => item.category === shopCategory || item.type === shopCategory)

  return (
    <div className="flex min-h-screen flex-col bg-[#f9fafb]">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-[#2c3e2d]">My Bonsai Garden</h1>
            <p className="text-[#5c6d5e]">Customize and grow your bonsai as you learn Japanese</p>
          </div>

          {/* Level Progress Bar */}
          <div className="mb-8 rounded-lg border border-[#dce4d7] bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2eb]">
                  <BonsaiIcon className="h-8 w-8 text-[#4a7c59]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#2c3e2d]">Level {bonsaiData.level} Bonsai</h2>
                  <p className="text-sm text-[#5c6d5e]">{bonsaiData.credits} credits earned</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-[#2c3e2d]">Next Level: {nextLevelMilestone?.name}</p>
                  <p className="text-xs text-[#5c6d5e]">
                    {nextLevelMilestone?.credits - bonsaiData.credits} credits needed
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2eb] text-[#4a7c59]">
                  {nextLevelMilestone?.level}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs">
                <span>Current: {bonsaiData.level}</span>
                <span>Next: {nextLevelMilestone?.level}</span>
              </div>
              <Progress value={progressToNextLevel} className="h-2 bg-[#dce4d7]" indicatorClassName="bg-[#4a7c59]" />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-[#eef2eb]">
              <TabsTrigger
                value="customize"
                className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white"
              >
                <Palette className="mr-2 h-4 w-4" />
                Customize Bonsai
              </TabsTrigger>
              <TabsTrigger value="shop" className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Bonsai Shop
              </TabsTrigger>
              <TabsTrigger
                value="milestones"
                className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white"
              >
                <Award className="mr-2 h-4 w-4" />
                Growth Milestones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customize" className="mt-0 border-0 p-0">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Bonsai Preview */}
                <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                  <h2 className="mb-4 text-xl font-semibold text-center text-[#2c3e2d]">Your Bonsai</h2>
                  <div className="flex flex-col items-center">
                    <div className="mb-4">
                      <BonsaiSVG 
                        treeColor={getTreeColor()} 
                        potColor={getPotColor()} 
                        decorations={getActiveDecorations()}
                        selectedEyes={selectedEyes}
                        selectedMouth={selectedMouth}
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-[#2c3e2d]">Level {bonsaiData.level} Bonsai</p>
                      <p className="text-sm text-[#5c6d5e]">{credits} Credits Available</p>
                    </div>
                  </div>
                </div>

                {/* Customization Options */}
                <div className="md:col-span-2 space-y-6">
                  {/* Tree Type */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      <Flower className="mr-2 inline-block h-5 w-5 text-[#4a7c59]" />
                      Tree Type
                    </h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {bonsaiData.trees
                        .filter((tree) => tree.unlocked)
                        .map((tree) => (
                          <div
                            key={tree.id}
                            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                              selectedTree === tree.id
                                ? "border-[#4a7c59] bg-[#eef2eb]"
                                : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                            }`}
                            onClick={() => {
                              setSelectedTree(tree.id)
                              setPreviewItem(null) // Clear preview when selecting a tree
                            }}
                          >
                            <div className="flex flex-col items-center">
                              <div className="mb-2 h-8 w-8 rounded-full" style={{ backgroundColor: tree.color }}></div>
                              <p className="text-center text-sm font-medium text-[#2c3e2d]">{tree.name}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Eyes */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      <Eye className="mr-2 inline-block h-5 w-5 text-[#4a7c59]" />
                      Eyes
                    </h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {bonsaiData.eyes
                        .filter((eyes) => eyes.unlocked)
                        .map((eyes) => (
                          <div
                            key={eyes.id}
                            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                              selectedEyes === eyes.id
                                ? "border-[#4a7c59] bg-[#eef2eb]"
                                : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                            }`}
                            onClick={() => {
                              setSelectedEyes(eyes.id)
                              setPreviewItem(null)
                            }}
                          >
                            <div className="flex flex-col items-center">
                              <div className="mb-2 h-8 w-8 rounded-full bg-[#f0f0f0] flex items-center justify-center">
                                <Eye className="h-4 w-4 text-[#4a7c59]" />
                              </div>
                              <p className="text-center text-sm font-medium text-[#2c3e2d]">{eyes.name}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Mouth */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      <svg className="mr-2 inline-block h-5 w-5 text-[#4a7c59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Mouth
                    </h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {bonsaiData.mouths
                        .filter((mouth) => mouth.unlocked)
                        .map((mouth) => (
                          <div
                            key={mouth.id}
                            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                              selectedMouth === mouth.id
                                ? "border-[#4a7c59] bg-[#eef2eb]"
                                : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                            }`}
                            onClick={() => {
                              setSelectedMouth(mouth.id)
                              setPreviewItem(null)
                            }}
                          >
                            <div className="flex flex-col items-center">
                              <div className="mb-2 h-8 w-8 rounded-full bg-[#f0f0f0] flex items-center justify-center">
                                <svg className="h-4 w-4 text-[#4a7c59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0" />
                                </svg>
                              </div>
                              <p className="text-center text-sm font-medium text-[#2c3e2d]">{mouth.name}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Pot Style */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      <Palette className="mr-2 inline-block h-5 w-5 text-[#4a7c59]" />
                      Pot Style
                    </h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                      {bonsaiData.pots
                        .filter((pot) => pot.unlocked)
                        .map((pot) => (
                          <div
                            key={pot.id}
                            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                              selectedPot === pot.id
                                ? "border-[#4a7c59] bg-[#eef2eb]"
                                : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                            }`}
                            onClick={() => {
                              setSelectedPot(pot.id)
                              setPreviewItem(null) // Clear preview when selecting a pot
                            }}
                          >
                            <div className="flex flex-col items-center">
                              <div
                                className="mb-2 h-6 w-12 rounded-t-sm rounded-b-md"
                                style={{ backgroundColor: pot.color }}
                              ></div>
                              <p className="text-center text-xs font-medium text-[#2c3e2d]">{pot.name}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Decorations */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      <Sparkles className="mr-2 inline-block h-5 w-5 text-[#4a7c59]" />
                      Decorations
                    </h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {bonsaiData.decorations
                        .filter((decoration) => decoration.unlocked)
                        .map((decoration) => (
                          <div
                            key={decoration.id}
                            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                              selectedDecorations.includes(decoration.id)
                                ? "border-[#4a7c59] bg-[#eef2eb]"
                                : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                            }`}
                            onClick={() => {
                              toggleDecoration(decoration.id)
                              setPreviewItem(null) // Clear preview when toggling decorations
                            }}
                          >
                            <div className="flex items-center">
                              {selectedDecorations.includes(decoration.id) ? (
                                <Check className="mr-2 h-5 w-5 text-[#4a7c59]" />
                              ) : (
                                <div className="mr-2 h-5 w-5 rounded-md border border-[#dce4d7]"></div>
                              )}
                              <div>
                                <p className="font-medium text-[#2c3e2d]">{decoration.name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <Button className="w-full bg-[#4a7c59] text-white hover:bg-[#3a6147]">Save Changes</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shop" className="mt-0 border-0 p-0">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Bonsai Preview */}
                <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                  <h2 className="mb-4 text-xl font-semibold text-center text-[#2c3e2d]">
                    {previewItem ? "Item Preview" : "Your Bonsai"}
                  </h2>
                  <div className="flex flex-col items-center">
                    <div className="mb-4">
                      <BonsaiSVG 
                        treeColor={getTreeColor()} 
                        potColor={getPotColor()} 
                        decorations={getActiveDecorations()}
                        selectedEyes={selectedEyes}
                        selectedMouth={selectedMouth}
                      />
                    </div>
                    <div className="text-center">
                      {previewItem ? (
                        <>
                          <p className="font-medium text-[#2c3e2d]">{previewItem.name}</p>
                          <p className="text-sm text-[#5c6d5e]">{previewItem.credits} Credits</p>
                          <Button
                            onClick={clearPreview}
                            variant="outline"
                            className="mt-2 text-[#4a7c59] border-[#4a7c59]"
                          >
                            Clear Preview
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-[#2c3e2d]">Level {bonsaiData.level} Bonsai</p>
                          <p className="text-sm text-[#5c6d5e]">{credits} Credits Available</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shop Items */}
                <div className="md:col-span-2">
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-[#2c3e2d]">Bonsai Shop</h2>
                      <div className="flex items-center gap-2 rounded-full bg-[#eef2eb] px-4 py-2">
                        <ShoppingBag className="h-4 w-4 text-[#4a7c59]" />
                        <span className="font-medium text-[#2c3e2d]">{credits} Credits Available</span>
                      </div>
                    </div>

                    <div className="mb-6 flex flex-wrap gap-2">
                      <button
                        className={`rounded-full px-4 py-1 text-sm font-medium ${
                          shopCategory === "all"
                            ? "bg-[#4a7c59] text-white"
                            : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
                        }`}
                        onClick={() => setShopCategory("all")}
                      >
                        All Items
                      </button>
                      <button
                        className={`rounded-full px-4 py-1 text-sm font-medium ${
                          shopCategory === "tree"
                            ? "bg-[#4a7c59] text-white"
                            : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
                        }`}
                        onClick={() => setShopCategory("tree")}
                      >
                        Trees
                      </button>
                      <button
                        className={`rounded-full px-4 py-1 text-sm font-medium ${
                          shopCategory === "pot"
                            ? "bg-[#4a7c59] text-white"
                            : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
                        }`}
                        onClick={() => setShopCategory("pot")}
                      >
                        Pots
                      </button>
                      <button
                        className={`rounded-full px-4 py-1 text-sm font-medium ${
                          shopCategory === "eyes"
                            ? "bg-[#4a7c59] text-white"
                            : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
                        }`}
                        onClick={() => setShopCategory("eyes")}
                      >
                        Eyes
                      </button>
                      <button
                        className={`rounded-full px-4 py-1 text-sm font-medium ${
                          shopCategory === "mouth"
                            ? "bg-[#4a7c59] text-white"
                            : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
                        }`}
                        onClick={() => setShopCategory("mouth")}
                      >
                        Mouth
                      </button>
                      <button
                        className={`rounded-full px-4 py-1 text-sm font-medium ${
                          shopCategory === "decoration"
                            ? "bg-[#4a7c59] text-white"
                            : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
                        }`}
                        onClick={() => setShopCategory("decoration")}
                      >
                        Decorations
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {filteredShopItems.map((item) => (
                        <div
                          key={`${item.type}-${item.id}`}
                          className="rounded-lg border border-[#dce4d7] bg-[#f8f7f4] p-4 transition-all hover:shadow-md"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#4a7c59]">
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </span>
                            <span className="flex items-center text-sm font-medium text-[#2c3e2d]">
                              {item.credits} credits
                            </span>
                          </div>
                          <div className="mb-3 flex items-center gap-3">
                            <div className="h-16 w-16 overflow-hidden rounded-md bg-white flex items-center justify-center">
                              {item.type === "tree" && (
                                <div className="h-10 w-10 rounded-full" style={{ backgroundColor: item.color }}></div>
                              )}
                              {item.type === "pot" && (
                                <div
                                  className="h-8 w-14 rounded-t-sm rounded-b-md"
                                  style={{ backgroundColor: item.color }}
                                ></div>
                              )}
                              {item.type === "eyes" && <Eye className="h-10 w-10 text-[#4a7c59]" />}
                              {item.type === "mouth" && (
                                <svg className="h-10 w-10 text-[#4a7c59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0" />
                                </svg>
                              )}
                              {item.type === "decoration" && <Sparkles className="h-10 w-10 text-[#4a7c59]" />}
                            </div>
                            <div>
                              <h3 className="font-medium text-[#2c3e2d]">{item.name}</h3>
                              <p className="text-sm text-[#5c6d5e]">
                                {item.description || `Unlock this ${item.type} for your bonsai`}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              className={`flex-1 ${
                                credits >= item.credits
                                  ? "bg-[#4a7c59] text-white hover:bg-[#3a6147]"
                                  : "bg-[#dce4d7] text-[#5c6d5e] cursor-not-allowed"
                              }`}
                              disabled={credits < item.credits}
                              onClick={() => purchaseItem(item)}
                            >
                              Purchase
                            </Button>
                            <Button
                              variant="outline"
                              className="flex items-center justify-center border-[#4a7c59] text-[#4a7c59]"
                              onClick={() => previewShopItem(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="milestones" className="mt-0 border-0 p-0">
              <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                <h2 className="mb-6 text-xl font-semibold text-[#2c3e2d]">Bonsai Growth Milestones</h2>

                <div className="relative mb-8">
                  <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-[#dce4d7]"></div>
                  <div
                    className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-[#4a7c59]"
                    style={{ width: `${(bonsaiData.credits / 2000) * 100}%` }}
                  ></div>

                  <div className="relative flex justify-between">
                    {bonsaiData.milestones.map((milestone, index) => (
                      <div
                        key={milestone.level}
                        className="flex flex-col items-center"
                        style={{ left: `${(milestone.credits / 2000) * 100}%` }}
                      >
                        <div
                          className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                            bonsaiData.credits >= milestone.credits
                              ? "bg-[#4a7c59] text-white"
                              : "bg-white text-[#5c6d5e] border border-[#dce4d7]"
                          }`}
                        >
                          {milestone.level}
                        </div>
                        <p className="mt-2 text-center text-sm font-medium text-[#2c3e2d]">{milestone.name}</p>
                        <p className="text-center text-xs text-[#5c6d5e]">{milestone.credits} credits</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-white p-4 text-[#5c6d5e]">
                  {bonsaiData.milestones.map((milestone) => (
                    <div key={milestone.level} className="mb-4 last:mb-0">
                      <h3 className="mb-1 text-lg font-semibold text-[#2c3e2d]">
                        {milestone.name} - Level {milestone.level}
                      </h3>
                      <p>{milestone.description}</p>
                      <p className="text-sm">Requires {milestone.credits} credits</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}