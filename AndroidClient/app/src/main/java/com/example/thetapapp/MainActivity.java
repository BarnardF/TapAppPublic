package com.example.thetapapp;

import androidx.appcompat.app.AppCompatActivity;
import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;

/**
 MainActivity:
 home screen for the Tap App.
 two main features:
 - Viewing all available taps.
 - Querying taps based on specific filters.
 */
public class MainActivity extends AppCompatActivity {

    // Buttons for navigation to different screens
    Button btnViewAllTaps, btnQueryTap;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize UI components
        btnViewAllTaps = findViewById(R.id.btnViewAllTaps);
        btnQueryTap = findViewById(R.id.btnQueryTap);

        // Go to "View All Taps" screen
        btnViewAllTaps.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, ViewAllTapsActivity.class);
            startActivity(intent);
        });

        // Go to "Query Tap" screen
        btnQueryTap.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, QueryTapsActivity.class);
            startActivity(intent);
        });
    }
}
