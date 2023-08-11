# Contributing

All contributions are welcome and greatly appreciated!

## Steps to Contribute

> [!WARNING]
>
> Check the `.node-version` file in the root of this repo so see what version of
> Node.js is required for local development - note, this can be different from
> the version of Node.js which runs the Action on GitHub runners. It is
> suggested to download [nodenv](https://github.com/nodenv/nodenv) which uses
> this file and manages your Node.js versions for you

1. Fork this repository
1. Commit your changes
1. Test your changes (learn how to test below)
1. Open a pull request back to this repository

   > Make sure to run `npm run all` as your final commit!

1. Notify the maintainers of this repository for peer review and approval
1. Merge :tada:

The maintainers of this repository will create a new release with your changes
so that everyone can use the new release and enjoy the awesome features of
branch deployments

## Testing

This project requires **100%** test coverage

> [!IMPORTANT]
>
> It is critical that we have 100% test coverage to ensure that we are not
> introducing any regressions. All changes will be throughly tested by
> maintainers of this repository before a new release is created.

### Running the Test Suite

Simply run the following command to execute the entire test suite:

```bash
npm run test
```

> [!NOTE]
>
> This requires that you have already run `npm install`
