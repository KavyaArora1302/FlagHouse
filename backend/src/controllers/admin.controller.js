export const getAdminStatus = async (req, res) => {
  res.json({
    ok: true,
    message: 'Admin access granted',
    admin: {
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};
