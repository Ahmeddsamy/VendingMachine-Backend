import jwt from "jsonwebtoken";
export const auth = (req, res, next) => {
  let { token } = req.headers;
  jwt.verify(token, "FlapKap", (err, decoded) => {
    if (err) return res.json({ message: "token err", err });
    req.userID = decoded.id;
    next();
  });
};
