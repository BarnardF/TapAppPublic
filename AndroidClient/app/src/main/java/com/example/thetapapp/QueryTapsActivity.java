package com.example.thetapapp;

import androidx.appcompat.app.AppCompatActivity;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.*;
import org.json.JSONObject;
import android.content.Intent;

/**
 QueryTapsActivity:
 Allows users to search for taps using filter criteria via dropdown menus.
 Sends an Intent to the QueryResultsActivity which is where the POST to the server happens
 */
public class QueryTapsActivity extends AppCompatActivity {

    // UI Elements
    Spinner spinnerContainerType, spinnerMaterial, spinnerSize, spinnerFlow, spinnerLiquidType;
    Button btnSearch;
    ProgressBar progressBar;
    LinearLayout resultsContainer;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_query_taps);

        // Initialize all UI components
        spinnerContainerType = findViewById(R.id.spinnerContainerType);
        spinnerMaterial = findViewById(R.id.spinnerMaterial);
        spinnerSize = findViewById(R.id.spinnerSize);
        spinnerFlow = findViewById(R.id.spinnerFlow);
        spinnerLiquidType = findViewById(R.id.spinnerLiquidType);
        btnSearch = findViewById(R.id.btnSearch);
        progressBar = findViewById(R.id.progressBar);
        resultsContainer = findViewById(R.id.resultsContainer);

        // Populate dropdowns from string-array resources
        setupSpinner(spinnerContainerType, R.array.container_types);
        setupSpinner(spinnerMaterial, R.array.materials);
        setupSpinner(spinnerSize, R.array.sizes);
        setupSpinner(spinnerFlow, R.array.flows);
        setupSpinner(spinnerLiquidType, R.array.liquid_types);

        // Handle search button click
        btnSearch.setOnClickListener(v -> performSearch());

        //OnItemSelectedListener that resets the colour of the background to white

        AdapterView.OnItemSelectedListener resetColor = new AdapterView.OnItemSelectedListener(){
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (position > 0){
                    parent.setBackgroundColor(Color.WHITE);
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {

            }
        };

        spinnerContainerType.setOnItemSelectedListener(resetColor);
        spinnerMaterial.setOnItemSelectedListener(resetColor);
        spinnerSize.setOnItemSelectedListener(resetColor);
        spinnerFlow.setOnItemSelectedListener(resetColor);
        spinnerLiquidType.setOnItemSelectedListener(resetColor);

    }

    //Function that attaches data to the spinners from an array stored in strings.xml
    private void setupSpinner(Spinner spinner, int arrayResId) {
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(
                this,
                arrayResId,
                android.R.layout.simple_spinner_item
        );
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(adapter);
    }

    //Creates a filter object and populates it with various search criteria
    private void performSearch() {
        boolean isValid = true;
        JSONObject filters = new JSONObject();

        if (!addFilterIfValid(filters, "container_type", spinnerContainerType)) {
            isValid = false;
        }
        if (!addFilterIfValid(filters, "material", spinnerMaterial)) {
            isValid = false;
        }
        if (!addFilterIfValid(filters, "size", spinnerSize)) {
            isValid = false;
        }
        if (!addFilterIfValid(filters, "flow_rate", spinnerFlow)) {
            isValid = false;
        }
        if (!addFilterIfValid(filters, "category", spinnerLiquidType)) {
            isValid = false;
        }

        if (!isValid)
        {
            Toast.makeText(getApplicationContext(),"Please ensure that all fields have a value selected",Toast.LENGTH_SHORT
            ).show();
            return;
        }

        // Pass filters as a String via Intent to QueryResultsActivity
        Intent intent = new Intent(QueryTapsActivity.this, QueryResultsActivity.class);
        intent.putExtra("filters", filters.toString());
        startActivity(intent);
    }


     /* Adds a key value pair to filters only if the spinner has an option selected that is not the first one.
        Changes the colour of the spinners to red if the value selected is 1 or some other error happens */

    private boolean addFilterIfValid(JSONObject json, String key, Spinner spinner) {
        if (spinner.getSelectedItemPosition() > 0) {
            try {
                String value = spinner.getSelectedItem().toString();
                json.put(key, value);
                return true;
            } catch (Exception ignored) {
                spinner.setBackgroundColor(Color.parseColor("#FF8C8C"));
                return false;
            }
        }
        else {
            spinner.setBackgroundColor(Color.parseColor("#FF8C8C"));
            return false;
        }
    }
}
