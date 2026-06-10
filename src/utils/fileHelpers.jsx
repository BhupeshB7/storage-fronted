import { Archive, File, FileText, Image, Music, Video } from "lucide-react";
import moment from "moment";

export const getFileIconComponent = (fileName, size = "default") => {
  const extension = fileName.split(".").pop().toLowerCase();
  const iconSize = size === "large" ? "w-12 h-12" : "w-8 h-8";

  const fileTypeIcons = {
    jpg: <Image className={`${iconSize} text-blue-500`} />,
    jpeg: <Image className={`${iconSize} text-blue-500`} />,
    png: <Image className={`${iconSize} text-blue-500`} />,
    gif: <Image className={`${iconSize} text-green-500`} />,
    bmp: <Image className={`${iconSize} text-blue-500`} />,
    svg: <Image className={`${iconSize} text-purple-500`} />,
    webp: <Image className={`${iconSize} text-blue-500`} />,

    pdf: <FileText className={`${iconSize} text-red-500`} />,
    doc: <FileText className={`${iconSize} text-blue-600`} />,
    docx: <FileText className={`${iconSize} text-blue-600`} />,
    txt: <FileText className={`${iconSize} text-zinc-600`} />,
    rtf: <FileText className={`${iconSize} text-blue-500`} />,

    xls: <FileText className={`${iconSize} text-green-600`} />,
    xlsx: <FileText className={`${iconSize} text-green-600`} />,
    csv: <FileText className={`${iconSize} text-green-500`} />,

    ppt: <FileText className={`${iconSize} text-orange-500`} />,
    pptx: <FileText className={`${iconSize} text-orange-500`} />,

    mp3: <Music className={`${iconSize} text-purple-500`} />,
    wav: <Music className={`${iconSize} text-purple-600`} />,
    aac: <Music className={`${iconSize} text-purple-500`} />,
    flac: <Music className={`${iconSize} text-purple-700`} />,
    ogg: <Music className={`${iconSize} text-purple-500`} />,

    mp4: <Video className={`${iconSize} text-red-600`} />,
    avi: <Video className={`${iconSize} text-red-500`} />,
    mov: <Video className={`${iconSize} text-red-700`} />,
    wmv: <Video className={`${iconSize} text-red-500`} />,
    mkv: <Video className={`${iconSize} text-red-800`} />,

    zip: <Archive className={`${iconSize} text-yellow-600`} />,
    rar: <Archive className={`${iconSize} text-yellow-700`} />,
    "7z": <Archive className={`${iconSize} text-yellow-800`} />,
    tar: <Archive className={`${iconSize} text-yellow-600`} />,
    gz: <Archive className={`${iconSize} text-yellow-700`} />,
  };

  return (
    fileTypeIcons[extension] || <File className={`${iconSize} text-zinc-500`} />
  );
};

export const formatTimeAgo = (dateString) => {
  const date = moment(dateString);
  const now = moment();

  if (now.diff(date, "minutes") < 1) {
    return "Just now";
  } else if (now.diff(date, "hours") < 1) {
    const minutes = now.diff(date, "minutes");
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (now.diff(date, "days") < 1) {
    const hours = now.diff(date, "hours");
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (now.diff(date, "days") < 7) {
    const days = now.diff(date, "days");
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else if (now.diff(date, "months") < 1) {
    const weeks = Math.floor(now.diff(date, "days") / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else if (now.diff(date, "years") < 1) {
    return date.format("MMM D");
  } else {
    return date.format("MMM D, YYYY");
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileType = (fileName) => {
  const extension = fileName.split(".").pop().toLowerCase();
  const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
  const documentTypes = ["pdf", "doc", "docx", "txt", "rtf"];
  const videoTypes = ["mp4", "avi", "mov", "wmv", "mkv"];

  if (imageTypes.includes(extension)) return "image";
  if (documentTypes.includes(extension)) return "document";
  if (videoTypes.includes(extension)) return "video";
  return "other";
};
