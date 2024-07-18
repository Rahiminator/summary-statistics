# summary-statistics

The Five Number Summary Calculator website is designed to help users quickly and efficiently calculate and visualise essential statistical metrics from their data. The website's primary focus is to allow users to upload a CSV file, compute the five number summary of the data, and display a corresponding box and whisker plot using D3.js library.

The current implementation of the website is designed to handle univariate data, meaning it expects a single column of numerical values in the CSV file. This allows it to calculate the five-number summary and generate a box and whisker plot for that single variable.

The parsed data is sorted in ascending order, and the following statistical metrics are computed:

- Minimum (Min): The smallest value in the dataset.
- First Quartile (Q1): The median of the lower half of the dataset.
- Median (Q2): The middle value of the dataset.
- Third Quartile (Q3): The median of the upper half of the dataset.
- Maximum (Max): The largest value in the dataset.
