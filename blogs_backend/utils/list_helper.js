const dummy = (blogs) => {
  return 1
}

const totalLikes = (bloglist) => {
  if (bloglist.length === 0) {
    return 0
  }

  if (bloglist.length === 1) {
    return bloglist[0].likes
  }

  const total = bloglist.reduce((total, blog) => total + (blog.likes || 0), 0)

  return total
}

module.exports = {
  dummy,
  totalLikes
}