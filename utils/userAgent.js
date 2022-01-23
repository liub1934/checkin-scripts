const DEFULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Edg/97.0.1072.55'

const getUserAgent = name => {
  return (
    process.env[`USER_AGENT_${name}`] ||
    process.env.USER_AGENT ||
    DEFULT_USER_AGENT
  )
}

module.exports = {
  getUserAgent
}
