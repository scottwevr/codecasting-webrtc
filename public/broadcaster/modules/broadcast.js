export async function broadcast(target, channel) {
  const serializer = new XMLSerializer();
  let options = {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true,
    attributeFilter: ["one", "two"],
    attributeOldValue: true,
    characterDataOldValue: true,
  };
  let timestamps = [];
  let observer = new MutationObserver((mutations) => {
    const data = serializer.serializeToString(target);
    channel.send(data);
  });
  observer.observe(target, options);
}
