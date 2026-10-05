import { FeedProviders, FeedProvidersNames, ProviderPrefixes, Providers } from '../../common';

describe('swifty feed racing provider registry', () => {
  it('registers r as the swifty feed racing provider', () => {
    expect(Providers.SWIFTY_FEED_RACING).toBe('swifty-feed-racing');
    expect(ProviderPrefixes.r).toBe(Providers.SWIFTY_FEED_RACING);
    expect(FeedProviders.SWIFTY_FEED_RACING).toBe('r');
    expect(FeedProvidersNames.r).toBe('Swifty Feed Racing');
  });

  it('keeps golf on s', () => {
    expect(ProviderPrefixes.s).toBe(Providers.SWIFTY_FEED);
    expect(FeedProviders.SWIFTY_FEED).toBe('s');
  });
});
